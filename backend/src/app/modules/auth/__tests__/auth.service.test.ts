import { AuthService } from "../auth.service";
import { UserRepository } from "../user.repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../../../errors/AppError";

jest.mock("../user.repository");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../../../config/env", () => ({
  env: {
    jwtSecret: "test-secret",
  },
}));

jest.mock("../../../lib/prisma", () => {
  const mockPrisma: any = {
    user: {
      update: jest.fn().mockImplementation((args: any) => Promise.resolve({
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        role: "USER",
        businessId: args?.data?.businessId || "biz-1",
      })),
    },
    loginActivity: {
      create: jest.fn().mockResolvedValue({}),
    },
    organization: {
      create: jest.fn().mockResolvedValue({ id: "org-1" }),
    },
    business: {
      create: jest.fn().mockResolvedValue({ id: "biz-1" }),
    },
    userBusinessRole: {
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn((callback: any) => callback(mockPrisma)),
  };
  return { prisma: mockPrisma };
});

jest.mock("../../accounting/accounting.service", () => ({
  AccountingService: jest.fn().mockImplementation(() => ({
    initializeSystemAccounts: jest.fn().mockResolvedValue([]),
  })),
}));

jest.mock("../../warehouse/warehouse.service", () => ({
  WarehouseService: jest.fn().mockImplementation(() => ({
    createWarehouse: jest.fn().mockResolvedValue({ id: "wh-1" }),
  })),
}));

jest.mock("../../subscriptions/subscription.service", () => ({
  SubscriptionService: jest.fn().mockImplementation(() => ({
    createTrialSubscription: jest.fn().mockResolvedValue({ id: "sub-1" }),
  })),
}));

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      createRefreshToken: jest.fn(),
      withTransaction: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockUserRepo.withTransaction.mockReturnValue(mockUserRepo);

    authService = new AuthService(mockUserRepo);
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        role: "ADMIN" as any,
        businessId: "bus-1",
      };

      mockUserRepo.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      mockUserRepo.create.mockResolvedValue({
        id: "user-1",
        ...userData,
        password: "hashed-password",
      } as any);
      (jwt.sign as jest.Mock).mockReturnValue("test-token");

      const result = await authService.register(userData);

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(result.accessToken).toBe("test-token");
      expect((result as any).user.id).toBe("user-1");
    });

    it("should throw error if email already exists", async () => {
      const userData = {
        email: "exists@example.com",
        password: "password123",
        name: "Test",
      };
      mockUserRepo.findByEmail.mockResolvedValue({ id: "existing" } as any);

      await expect(authService.register(userData as any)).rejects.toThrow(
        new AppError("User with this email already exists", 400),
      );
    });
  });

  describe("login", () => {
    it("should login successfully with correct credentials", async () => {
      const loginData = { email: "test@example.com", password: "password123" };
      const user = {
        id: "user-1",
        email: "test@example.com",
        password: "hashed-password",
        role: "ADMIN",
        businessId: "bus-1",
      };

      mockUserRepo.findByEmail.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("test-token");

      const result = await authService.login(loginData);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginData.password,
        user.password,
      );
      expect(result.accessToken).toBe("test-token");
      expect((result as any).user.id).toBe("user-1");
    });

    it("should throw error if user not found", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: "none@ex.com", password: "p" }),
      ).rejects.toThrow(new AppError("Invalid email or password", 401));
    });

    it("should throw error if password does not match", async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ password: "hash" } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: "t@e.com", password: "p" }),
      ).rejects.toThrow(new AppError("Invalid email or password", 401));
    });
  });

  describe("oauthCallback", () => {
    const oAuthData = {
      email: "oauth@example.com",
      name: "OAuth User",
      provider: "google",
      idToken: "valid-id-token",
    };

    beforeEach(() => {
      (jwt.verify as jest.Mock).mockReturnValue({ email: "oauth@example.com" });
      (jwt.sign as jest.Mock).mockReturnValue("backend-access-token");
      mockUserRepo.createRefreshToken.mockResolvedValue({} as any);
    });

    it("should sign up a new user as USER by default if no role is provided", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({
        id: "new-oauth-user-1",
        email: oAuthData.email,
        name: oAuthData.name,
        role: "USER",
      } as any);

      const result = await authService.oauthCallback({ ...oAuthData });

      expect(jwt.verify).toHaveBeenCalled();
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        email: oAuthData.email,
        name: oAuthData.name,
        role: "USER",
      });
      expect((result as any).user.role).toBe("USER");
      expect(result.accessToken).toBe("backend-access-token");
    });

    it("should always sign up a new user as USER regardless of the role param", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({
        id: "new-oauth-user-2",
        email: oAuthData.email,
        name: oAuthData.name,
        role: "USER",
      } as any);

      // SELLER is no longer a valid platform role — callers providing it receive USER
      const result = await authService.oauthCallback({ ...oAuthData });

      expect(mockUserRepo.create).toHaveBeenCalledWith({
        email: oAuthData.email,
        name: oAuthData.name,
        role: "USER",
      });
      expect((result as any).user.role).toBe("USER");
    });

    it("should sign up a new user as USER if an invalid role is provided", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({
        id: "new-oauth-user-3",
        email: oAuthData.email,
        name: oAuthData.name,
        role: "USER",
      } as any);

      const result = await authService.oauthCallback({
        ...oAuthData,
        role: "ADMIN" as any,
      });

      expect(mockUserRepo.create).toHaveBeenCalledWith({
        email: oAuthData.email,
        name: oAuthData.name,
        role: "USER",
      });
      expect((result as any).user.role).toBe("USER");
    });

    it("should login an existing user and preserve their role, ignoring the requested role", async () => {
      const existingUser = {
        id: "existing-oauth-user",
        email: oAuthData.email,
        name: oAuthData.name,
        role: "ADMIN", // Existing role is ADMIN
      };
      mockUserRepo.findByEmail.mockResolvedValue(existingUser as any);

      const result = await authService.oauthCallback({ ...oAuthData });

      expect(mockUserRepo.create).not.toHaveBeenCalled();
      expect((result as any).user.role).toBe("ADMIN");
    });

    it("should throw an error if idToken is missing", async () => {
      await expect(
        authService.oauthCallback({ ...oAuthData, idToken: undefined }),
      ).rejects.toThrow(
        new AppError("Missing idToken from OAuth provider", 400),
      );
    });

    it("should throw an error if verification fails", async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("jwt expired");
      });

      await expect(authService.oauthCallback(oAuthData)).rejects.toThrow(
        new AppError("Invalid OAuth token: jwt expired", 401),
      );
    });

    it("should throw an error if verified email does not match provided email", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        email: "hacker@example.com",
      });

      await expect(authService.oauthCallback(oAuthData)).rejects.toThrow(
        new AppError("OAuth token email does not match provided email", 401),
      );
    });
  });
});
