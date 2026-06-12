import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from '../../shared/utils/encryption';
import { AuditService } from '../audit/audit.service';
import { IpRuleType } from '../../../generated/client';

export class SecurityService {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  /**
   * Initialize MFA Setup: Generate secret and return QR code data URI.
   */
  async setupMFA(userId: string, email: string) {
    const generated = speakeasy.generateSecret({
      name: `AgriQon Market:${email}`,
      issuer: 'AgriQon Market',
    });
    const base32Secret = generated.base32;
    const otpauthUrl = generated.otpauth_url!;
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Temporarily save the encrypted secret to the user record for verification step.
    const encryptedSecret = encrypt(base32Secret);
    await prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: encryptedSecret },
    });

    return {
      secret: base32Secret, // Raw secret to display to user if they want to enter manually
      qrCodeDataUrl,
    };
  }

  /**
   * Verify and Enable MFA: Validate setup code, generate backup codes, and activate MFA status.
   */
  async verifyAndEnableMFA(userId: string, code: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      throw new AppError('MFA setup has not been initialized', httpStatus.BAD_REQUEST);
    }

    const decryptedSecret = decrypt(user.mfaSecret);
    const isValid = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!isValid) {
      throw new AppError('Invalid verification code. Setup failed.', httpStatus.BAD_REQUEST);
    }

    // Generate 8 alphanumeric backup recovery codes (each 8 chars long)
    const backupCodes: string[] = [];
    const hashedBackupCodes: string[] = [];
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let k = 0; k < 8; k++) {
      let rawCode = '';
      for (let j = 0; j < 8; j++) {
        rawCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      backupCodes.push(rawCode);
      const hashed = await bcrypt.hash(rawCode, 10);
      hashedBackupCodes.push(hashed);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaBackupCodes: hashedBackupCodes,
      },
    });

    await this.auditService.log({
      businessId: user.businessId || 'platform',
      userId: user.id,
      action: 'MFA_ENABLED',
      entityType: 'User',
      entityId: user.id,
      newData: { enabled: true },
    });

    return {
      success: true,
      backupCodes, // Return raw backup codes to the user once to store safely
    };
  }

  /**
   * Disable MFA.
   */
  async disableMFA(userId: string, code: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw new AppError('MFA is not enabled for this user', httpStatus.BAD_REQUEST);
    }

    const decryptedSecret = decrypt(user.mfaSecret);
    const isValid = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!isValid) {
      throw new AppError('Invalid code. MFA cannot be disabled.', httpStatus.BAD_REQUEST);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
      },
    });

    await this.auditService.log({
      businessId: user.businessId || 'platform',
      userId: user.id,
      action: 'MFA_DISABLED',
      entityType: 'User',
      entityId: user.id,
      newData: { enabled: false },
    });

    return { success: true };
  }

  /**
   * Persisted Login Activity logs retrieve.
   */
  async getLoginActivity(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.loginActivity.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.loginActivity.count({
        where: { userId },
      }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── IP Filtering CIDR Controls ─────────────────────────────────────

  async listIpRules(businessId: string) {
    return await prisma.businessIpRule.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createIpRule(
    businessId: string,
    data: { ipRange: string; type: IpRuleType; description?: string }
  ) {
    const rule = await prisma.businessIpRule.create({
      data: {
        businessId,
        ipRange: data.ipRange,
        type: data.type,
        description: data.description,
      },
    });

    await this.auditService.log({
      businessId,
      action: 'IP_RULE_CREATED',
      entityType: 'BusinessIpRule',
      entityId: rule.id,
      newData: rule,
    });

    return rule;
  }

  async updateIpRule(
    businessId: string,
    id: string,
    data: { ipRange?: string; type?: IpRuleType; description?: string; isActive?: boolean }
  ) {
    const rule = await prisma.businessIpRule.findFirst({
      where: { id, businessId },
    });
    if (!rule) {
      throw new AppError('IP configuration rule not found', httpStatus.NOT_FOUND);
    }

    const updated = await prisma.businessIpRule.update({
      where: { id },
      data,
    });

    await this.auditService.log({
      businessId,
      action: 'IP_RULE_UPDATED',
      entityType: 'BusinessIpRule',
      entityId: id,
      previousData: rule,
      newData: updated,
    });

    return updated;
  }

  async deleteIpRule(businessId: string, id: string) {
    const rule = await prisma.businessIpRule.findFirst({
      where: { id, businessId },
    });
    if (!rule) {
      throw new AppError('IP configuration rule not found', httpStatus.NOT_FOUND);
    }

    await prisma.businessIpRule.delete({ where: { id } });

    await this.auditService.log({
      businessId,
      action: 'IP_RULE_DELETED',
      entityType: 'BusinessIpRule',
      entityId: id,
      previousData: rule,
    });

    return { success: true };
  }
}
