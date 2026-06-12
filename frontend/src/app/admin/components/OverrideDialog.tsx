'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';

interface OverrideDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: any;
  submitting: boolean;
  onApplyOverride: (data: {
    planCode: string;
    status: string;
    expiresAt?: string;
    reason: string;
  }) => Promise<void>;
}

export function OverrideDialog({ isOpen, onOpenChange, tenant, submitting, onApplyOverride }: OverrideDialogProps) {
  const [overridePlanCode, setOverridePlanCode] = useState('TRIAL');
  const [overrideStatus, setOverrideStatus] = useState('TRIAL');
  const [overrideExpiresAt, setOverrideExpiresAt] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  useEffect(() => {
    if (tenant) {
      setOverridePlanCode(tenant.subscription?.planCode || 'TRIAL');
      setOverrideStatus(tenant.subscription?.status || 'TRIAL');
      if (tenant.subscription?.expiresAt) {
        setOverrideExpiresAt(new Date(tenant.subscription.expiresAt).toISOString().split('T')[0]);
      } else {
        setOverrideExpiresAt('');
      }
      setOverrideReason('');
    }
  }, [tenant, isOpen]);

  const handleSubmit = async () => {
    if (!overrideReason.trim()) {
      toast.error('Please provide an override reason');
      return;
    }

    await onApplyOverride({
      planCode: overridePlanCode,
      status: overrideStatus,
      expiresAt: overrideExpiresAt || undefined,
      reason: overrideReason,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Override Tenant Subscription</DialogTitle>
          <DialogDescription className="text-slate-400">
            Directly override SaaS platform details for tenant: <span className="text-indigo-400 font-bold">{tenant?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan" className="text-slate-300">Target Plan Code</Label>
              <Select value={overridePlanCode} onValueChange={setOverridePlanCode}>
                <SelectTrigger id="plan" className="bg-slate-950 border-slate-800 text-slate-100">
                  <SelectValue placeholder="Select target plan" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="TRIAL">TRIAL</SelectItem>
                  <SelectItem value="PRO">PRO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-300">Target SaaS Status</Label>
              <Select value={overrideStatus} onValueChange={setOverrideStatus}>
                <SelectTrigger id="status" className="bg-slate-950 border-slate-800 text-slate-100">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="TRIAL">TRIAL</SelectItem>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="GRACE_PERIOD">GRACE_PERIOD</SelectItem>
                  <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt" className="text-slate-300">Expiration Date Override</Label>
            <Input
              id="expiresAt"
              type="date"
              className="bg-slate-950 border-slate-800 text-slate-100"
              value={overrideExpiresAt}
              onChange={(e) => setOverrideExpiresAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-slate-300 flex items-center space-x-1">
              <span>Override Reason</span>
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Required. Please explain why you are manually changing this subscription status..."
              className="bg-slate-950 border-slate-800 text-slate-100 min-h-[80px]"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
            />
            <p className="text-[10px] text-slate-500">This reason will be logged to tenant events and platform audits.</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Saving...' : 'Apply Override'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
