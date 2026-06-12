'use client';

import React, { useEffect, useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ShieldCheck,
  Smartphone,
  History,
  Globe,
  Trash2,
  Power,
  XCircle,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  KeyRound,
  Loader2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import { securityService, SessionInfo, LoginActivity, IpRule, MfaSetupResponse } from '@/services/api/security.service';

export default function SecuritySettingsPage() {
  const { user } = useAuthStore();
  const isOwnerOrManager = user?.role === 'OWNER' || user?.role === 'MANAGER';

  // State Management
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([]);
  const [ipRules, setIpRules] = useState<IpRule[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  
  // Pagination
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);

  // MFA state
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState<MfaSetupResponse | null>(null);
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false);
  const [mfaVerificationCode, setMfaVerificationCode] = useState('');
  const [mfaStep, setMfaStep] = useState<'setup' | 'backup-codes'>('setup');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disableMfaDialogOpen, setDisableMfaDialogOpen] = useState(false);

  // IP Rules state
  const [ipDialogOpen, setIpDialogOpen] = useState(false);
  const [newIpRange, setNewIpRange] = useState('');
  const [newIpType, setNewIpType] = useState<'ALLOW' | 'DENY'>('ALLOW');
  const [newIpDesc, setNewIpDesc] = useState('');
  const [editingIpRule, setEditingIpRule] = useState<IpRule | null>(null);

  // Load Data
  const loadSessions = async () => {
    try {
      const data = await securityService.listSessions();
      setSessions(data || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadLoginActivity = async (page = 1) => {
    try {
      const data = await securityService.listLoginActivity(page, 5);
      setLoginActivity(data.items || []);
      setActivityTotalPages(data.pagination.totalPages || 1);
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadIpRules = async () => {
    if (!isOwnerOrManager) return;
    try {
      const data = await securityService.listIpRules();
      setIpRules(data || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSessions();
    loadLoginActivity(activityPage);
    loadIpRules();
    // Simulate reading current MFA state from user profile / store or default to profile check
    if (user) {
      // User properties may not contain MFA boolean on client if not refreshed, so we sync or assume local toggle.
      // We will check user profile or sync from API behavior.
    }
  }, [user, activityPage]);

  // MFA Operations
  const handleInitiateMfa = async () => {
    setLoading((prev) => ({ ...prev, mfaInit: true }));
    try {
      const setup = await securityService.getMfaSetup();
      setMfaSetupData(setup);
      setMfaStep('setup');
      setMfaVerificationCode('');
      setMfaDialogOpen(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initialize MFA setup');
    } finally {
      setLoading((prev) => ({ ...prev, mfaInit: false }));
    }
  };

  const handleVerifyMfa = async () => {
    if (!mfaVerificationCode) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    setLoading((prev) => ({ ...prev, mfaVerify: true }));
    try {
      const res = await securityService.verifyAndEnableMfa(mfaVerificationCode);
      setBackupCodes(res.backupCodes || []);
      setMfaEnabled(true);
      setMfaStep('backup-codes');
      toast.success('MFA successfully enabled!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading((prev) => ({ ...prev, mfaVerify: false }));
    }
  };

  const handleDisableMfa = async () => {
    if (!mfaVerificationCode) {
      toast.error('Please enter your 2FA verification code');
      return;
    }
    setLoading((prev) => ({ ...prev, mfaDisable: true }));
    try {
      await securityService.disableMfa(mfaVerificationCode);
      setMfaEnabled(false);
      setDisableMfaDialogOpen(false);
      toast.success('MFA has been disabled');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to disable MFA. Incorrect code.');
    } finally {
      setLoading((prev) => ({ ...prev, mfaDisable: false }));
    }
  };

  // Session Operations
  const handleRevokeSession = async (id: string) => {
    try {
      await securityService.revokeSession(id);
      toast.success('Session revoked successfully');
      loadSessions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to revoke session');
    }
  };

  const handleRevokeOthers = async () => {
    if (!confirm('Are you sure you want to terminate all other active login sessions?')) return;
    setLoading((prev) => ({ ...prev, revokeOthers: true }));
    try {
      await securityService.revokeAllOtherSessions();
      toast.success('All other sessions terminated successfully');
      loadSessions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to terminate other sessions');
    } finally {
      setLoading((prev) => ({ ...prev, revokeOthers: false }));
    }
  };

  // IP Rules Operations
  const handleSaveIpRule = async () => {
    if (!newIpRange) {
      toast.error('Please enter a valid IP address or CIDR range');
      return;
    }
    setLoading((prev) => ({ ...prev, ipRule: true }));
    try {
      if (editingIpRule) {
        await securityService.updateIpRule(editingIpRule.id, {
          ipRange: newIpRange,
          type: newIpType,
          description: newIpDesc,
        });
        toast.success('IP rule updated successfully');
      } else {
        await securityService.createIpRule({
          ipRange: newIpRange,
          type: newIpType,
          description: newIpDesc,
        });
        toast.success('IP rule created successfully');
      }
      setIpDialogOpen(false);
      loadIpRules();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save IP restriction rule');
    } finally {
      setLoading((prev) => ({ ...prev, ipRule: false }));
    }
  };

  const handleToggleIpRule = async (rule: IpRule) => {
    try {
      await securityService.updateIpRule(rule.id, { isActive: !rule.isActive });
      toast.success(`Rule is now ${!rule.isActive ? 'enabled' : 'disabled'}`);
      loadIpRules();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle rule');
    }
  };

  const handleDeleteIpRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this IP restriction rule?')) return;
    try {
      await securityService.deleteIpRule(id);
      toast.success('IP rule removed');
      loadIpRules();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove IP rule');
    }
  };

  const openAddIpDialog = () => {
    setEditingIpRule(null);
    setNewIpRange('');
    setNewIpType('ALLOW');
    setNewIpDesc('');
    setIpDialogOpen(true);
  };

  const openEditIpDialog = (rule: IpRule) => {
    setEditingIpRule(rule);
    setNewIpRange(rule.ipRange);
    setNewIpType(rule.type);
    setNewIpDesc(rule.description || '');
    setIpDialogOpen(true);
  };

  return (
    <PageShell
      title="Security & Compliance"
      description="Manage account authentication, MFA settings, device sessions, and workspace IP controls."
    >
      <Tabs defaultValue="authentication" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="authentication" className="gap-2">
            <Lock className="size-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Laptop className="size-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="restrictions" className="gap-2">
            <Globe className="size-4" />
            Access Rules
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: Authentication (MFA / History) ────────────────────────── */}
        <TabsContent value="authentication" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* MFA Panel */}
            <Card className="md:col-span-1 border shadow-sm h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-slate-800">2-Factor Auth (MFA)</CardTitle>
                  {mfaEnabled ? (
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500">Disabled</Badge>
                  )}
                </div>
                <CardDescription className="text-xs">Secure your workspace logins via standard authenticator app.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <Smartphone className="size-8 text-indigo-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-xs block text-slate-700">TOTP Authenticator</span>
                    <span className="text-[10px] text-muted-foreground">Google Authenticator, Duo, or Bitwarden.</span>
                  </div>
                </div>

                {mfaEnabled ? (
                  <Button
                    onClick={() => {
                      setMfaVerificationCode('');
                      setDisableMfaDialogOpen(true);
                    }}
                    variant="destructive"
                    className="w-full text-xs font-semibold gap-1.5 cursor-pointer"
                  >
                    <Power className="size-4" />
                    Disable 2FA
                  </Button>
                ) : (
                  <Button
                    onClick={handleInitiateMfa}
                    disabled={loading.mfaInit}
                    className="w-full text-xs font-semibold gap-1.5 cursor-pointer"
                  >
                    {loading.mfaInit ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                    Enable 2FA
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Login Logs */}
            <Card className="md:col-span-2 border shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-bold text-slate-800">Login Activity Logs</CardTitle>
                <CardDescription className="text-xs">Audit history of recent authorization trials.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="text-xs">
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="py-2.5 font-bold uppercase text-[10px]">Client / Browser</TableHead>
                      <TableHead className="py-2.5 font-bold uppercase text-[10px]">IP Address</TableHead>
                      <TableHead className="py-2.5 font-bold uppercase text-[10px]">Date</TableHead>
                      <TableHead className="py-2.5 font-bold uppercase text-[10px] text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginActivity.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No recent login activity.
                        </TableCell>
                      </TableRow>
                    ) : (
                      loginActivity.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-semibold text-slate-700 py-3">{log.userAgent || 'Unknown Agent'}</TableCell>
                          <TableCell className="font-mono text-muted-foreground">{log.ipAddress}</TableCell>
                          <TableCell className="text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Badge
                              className={`text-[9px] font-bold uppercase ${
                                log.status === 'SUCCESS'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-50'
                                  : log.status === 'MFA_REQUIRED'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-50'
                                  : 'bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-50'
                              }`}
                            >
                              {log.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination footer */}
                {activityTotalPages > 1 && (
                  <div className="flex items-center justify-between p-3 border-t bg-slate-50/50">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                      disabled={activityPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Page {activityPage} of {activityTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setActivityPage((p) => Math.min(activityTotalPages, p + 1))}
                      disabled={activityPage === activityTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── TAB 2: Sessions ────────────────────────────────────────────────── */}
        <TabsContent value="sessions" className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row justify-between items-center pb-4 border-b">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Active Access Sessions</CardTitle>
                <CardDescription className="text-xs">Manage active browser sessions on your account.</CardDescription>
              </div>
              {sessions.length > 1 && (
                <Button
                  onClick={handleRevokeOthers}
                  disabled={loading.revokeOthers}
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100 cursor-pointer"
                >
                  {loading.revokeOthers ? <Loader2 className="size-3.5 animate-spin" /> : <Power className="size-3.5" />}
                  Revoke Others
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table className="text-xs">
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="py-2.5 font-bold uppercase text-[10px]">OS / Device</TableHead>
                    <TableHead className="py-2.5 font-bold uppercase text-[10px]">Browser</TableHead>
                    <TableHead className="py-2.5 font-bold uppercase text-[10px]">IP Address</TableHead>
                    <TableHead className="py-2.5 font-bold uppercase text-[10px]">Last Login</TableHead>
                    <TableHead className="py-2.5 font-bold uppercase text-[10px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No active sessions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-semibold text-slate-700 py-4 flex items-center gap-2">
                          <Laptop className="size-4 text-slate-500 shrink-0" />
                          <span>{session.os || 'Unknown OS'}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{session.browser || 'Unknown Browser'}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">{session.ipAddress}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(session.lastUsedAt).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => handleRevokeSession(session.id)}
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs font-semibold cursor-pointer text-rose-600 hover:text-rose-700 hover:bg-rose-50/50"
                          >
                            <XCircle className="size-3.5 mr-1" />
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 3: Access Rules (IP Whitelist/Blacklist) ───────────────────── */}
        <TabsContent value="restrictions" className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row justify-between items-center pb-4 border-b">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">IP Filtering Controls</CardTitle>
                <CardDescription className="text-xs">Whitelist or Blacklist user login access by CIDR subnets.</CardDescription>
              </div>
              {isOwnerOrManager && (
                <Button onClick={openAddIpDialog} size="sm" className="text-xs font-semibold gap-1.5 cursor-pointer">
                  <Plus className="size-4" />
                  Add New Rule
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {!isOwnerOrManager ? (
                <div className="p-8 text-center">
                  <AlertTriangle className="size-8 text-amber-500 mx-auto mb-2" />
                  <span className="font-semibold block text-slate-700 text-sm">Privileged Operation Locked</span>
                  <span className="text-xs text-muted-foreground">Only Tenant Owners or Managers can register CIDR subnets.</span>
                </div>
              ) : (
                <Table className="text-xs">
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="py-2.5 font-bold uppercase text-[10px]">CIDR Network Subnet</TableHead>
                      <TableHead className="py-2.5 font-bold uppercase text-[10px]">Filter Mode</TableHead>
                      <TableHead className="py-2.5 font-bold uppercase text-[10px]">Description</TableHead>
                      <TableHead className="py-2.5 font-bold uppercase text-[10px]">Toggle</TableHead>
                      <TableHead className="py-2.5 font-bold uppercase text-[10px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ipRules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No IP restriction rules configured for this organization.
                        </TableCell>
                      </TableRow>
                    ) : (
                      ipRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-mono font-bold text-slate-700 py-3">{rule.ipRange}</TableCell>
                          <TableCell>
                            <Badge
                              className={`text-[9px] font-bold ${
                                rule.type === 'ALLOW'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-50'
                                  : 'bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-50'
                              }`}
                            >
                              {rule.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{rule.description || '—'}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-6 text-[10px] px-2 font-bold cursor-pointer ${
                                rule.isActive
                                  ? 'text-emerald-700 border-emerald-100 bg-emerald-50 hover:bg-emerald-100'
                                  : 'text-slate-500 border-slate-200 bg-slate-50 hover:bg-slate-100'
                              }`}
                              onClick={() => handleToggleIpRule(rule)}
                            >
                              {rule.isActive ? 'Active' : 'Disabled'}
                            </Button>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs font-semibold cursor-pointer text-primary"
                              onClick={() => openEditIpDialog(rule)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs font-semibold cursor-pointer text-rose-600 hover:text-rose-700"
                              onClick={() => handleDeleteIpRule(rule.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── DIALOG: Setup MFA ──────────────────────────────────────────────── */}
      <Dialog open={mfaDialogOpen} onOpenChange={setMfaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {mfaStep === 'setup' ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-slate-800">Set Up Multi-Factor Auth</DialogTitle>
                <DialogDescription className="text-xs">
                  Scan the QR code below or enter the code manually inside your authenticator app.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center gap-4 py-4">
                {mfaSetupData?.qrCodeDataUrl && (
                  <img
                    src={mfaSetupData.qrCodeDataUrl}
                    alt="MFA QR Code"
                    className="w-44 h-44 border p-2 rounded-lg bg-white"
                  />
                )}
                <div className="w-full space-y-1.5 text-center">
                  <Label className="text-[10px] uppercase font-bold text-slate-500">Manual setup secret</Label>
                  <span className="block font-mono text-xs select-all bg-slate-50 p-2 rounded border border-slate-100 break-all font-semibold">
                    {mfaSetupData?.secret}
                  </span>
                </div>

                <div className="w-full space-y-1.5 mt-2">
                  <Label htmlFor="mfa-verify-code" className="text-xs font-semibold">Verification Code</Label>
                  <Input
                    id="mfa-verify-code"
                    placeholder="Enter 6-digit authenticator code"
                    value={mfaVerificationCode}
                    onChange={(e) => setMfaVerificationCode(e.target.value)}
                    maxLength={6}
                    className="text-center font-mono font-bold tracking-widest text-sm py-2"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" className="text-xs" onClick={() => setMfaDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleVerifyMfa} disabled={loading.mfaVerify} className="text-xs font-semibold cursor-pointer">
                  {loading.mfaVerify ? <Loader2 className="size-4 animate-spin" /> : 'Confirm & Enable'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  MFA Setup Completed Successfully!
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Store these recovery backup codes in a safe place. They will not be displayed again.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-3">
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="size-4 text-amber-600" />
                  <AlertTitle className="text-xs font-bold text-amber-800">Warning</AlertTitle>
                  <AlertDescription className="text-[10px] text-amber-700">
                    If you lose your authenticator device, you will need one of these backup codes to access your account.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {backupCodes.map((code, index) => (
                    <span key={index} className="font-mono text-xs font-bold text-slate-700 text-center select-all py-1">
                      {code}
                    </span>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button className="w-full text-xs font-semibold cursor-pointer" onClick={() => setMfaDialogOpen(false)}>
                  I have saved these codes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── DIALOG: Disable MFA ───────────────────────────────────────────── */}
      <Dialog open={disableMfaDialogOpen} onOpenChange={setDisableMfaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">Disable Two-Factor Auth</DialogTitle>
            <DialogDescription className="text-xs text-rose-600">
              Disabling MFA reduces your account security. Provide your current authenticator code to proceed.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="disable-mfa-code" className="text-xs font-semibold">Verification Code</Label>
              <Input
                id="disable-mfa-code"
                placeholder="6-digit authenticator code"
                value={mfaVerificationCode}
                onChange={(e) => setMfaVerificationCode(e.target.value)}
                maxLength={6}
                className="text-center font-mono font-bold tracking-widest text-sm py-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="text-xs" onClick={() => setDisableMfaDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisableMfa}
              disabled={loading.mfaDisable}
              className="text-xs font-semibold cursor-pointer"
            >
              {loading.mfaDisable ? <Loader2 className="size-4 animate-spin" /> : 'Confirm Disable'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DIALOG: Add/Edit IP Rule ──────────────────────────────────────── */}
      <Dialog open={ipDialogOpen} onOpenChange={setIpDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800">
              {editingIpRule ? 'Edit IP Restriction Rule' : 'Add IP Restriction Rule'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Restrict organization access based on specific network IP addresses or CIDR ranges.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="cidr-input" className="text-xs font-semibold">IP Address / CIDR Range</Label>
              <Input
                id="cidr-input"
                placeholder="e.g. 192.168.1.0/24 or 203.0.113.50"
                value={newIpRange}
                onChange={(e) => setNewIpRange(e.target.value)}
                className="font-mono text-sm py-2"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Access Policy Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="ipType"
                    checked={newIpType === 'ALLOW'}
                    onChange={() => setNewIpType('ALLOW')}
                    className="accent-primary"
                  />
                  Allow access (Whitelist)
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="ipType"
                    checked={newIpType === 'DENY'}
                    onChange={() => setNewIpType('DENY')}
                    className="accent-primary"
                  />
                  Deny access (Blacklist)
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ip-desc" className="text-xs font-semibold">Description</Label>
              <Input
                id="ip-desc"
                placeholder="e.g. Head Office Subnet"
                value={newIpDesc}
                onChange={(e) => setNewIpDesc(e.target.value)}
                className="text-xs py-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="text-xs" onClick={() => setIpDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveIpRule} disabled={loading.ipRule} className="text-xs font-semibold cursor-pointer">
              {loading.ipRule ? <Loader2 className="size-4 animate-spin" /> : editingIpRule ? 'Update Rule' : 'Add Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
