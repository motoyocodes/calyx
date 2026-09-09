"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUIState } from "@/context/UIStateContext";
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Copy,
  Check,
  Download,
  X,
  Smartphone,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_BACKUP_CODES = [
  "CALYX-9F3A-81B2",
  "CALYX-47E2-108D",
  "CALYX-6A91-88FE",
  "CALYX-B410-92C3",
  "CALYX-2E77-49A1",
  "CALYX-88FD-31A9",
  "CALYX-55C2-77EA",
  "CALYX-19B4-630D",
];

export default function TwoFactorModal({ isOpen, onClose }: TwoFactorModalProps) {
  const { user, enableTwoFactor, disableTwoFactor } = useAuth();
  const { addToast, addAuditLog } = useUIState();

  const [step, setStep] = useState<"setup" | "verify" | "backup">("setup");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>(DEFAULT_BACKUP_CODES);
  const [isDisabling, setIsDisabling] = useState(false);

  const secretKey = "JBSWY3DPEHPK3PXP";

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    addToast({
      title: "Secret Key Copied",
      description: "Paste this key into Google Authenticator or 1Password.",
      type: "info",
    });
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedBackupCodes(true);
    setTimeout(() => setCopiedBackupCodes(false), 2000);
    addToast({
      title: "Backup Codes Copied",
      description: "Save these 8 recovery codes in a secure offline location.",
      type: "success",
    });
  };

  const handleDownloadBackupCodes = () => {
    const content = `CALYX ENTERPRISE RECOVERY CODES\nAccount: ${user?.email}\nGenerated: ${new Date().toISOString()}\n\n${backupCodes.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nKeep these single-use codes safe. Each code can only be used once if you lose access to your authenticator app.`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `calyx-backup-codes-${user?.email?.split("@")[0] || "security"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    addToast({
      title: "Recovery File Saved",
      description: "calyx-backup-codes.txt has been downloaded.",
      type: "success",
    });
  };

  const handleVerifyAndEnable = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim().length !== 6 || !/^\d+$/.test(verificationCode.trim())) {
      setCodeError("Please enter a valid 6-digit numeric TOTP code.");
      return;
    }

    // Success simulation
    setCodeError("");
    enableTwoFactor();
    addAuditLog({
      event: "security.2fa_enabled",
      category: "security",
      actor: user?.name || "Admin User",
      actorRole: user?.role === "admin" ? "Admin" : "Billing",
      ipAddress: "192.168.1.42 (US-East)",
      target: "TOTP Authenticator",
      severity: "info",
      details: "Two-Factor Authentication (TOTP) successfully activated for operator account; 8 emergency backup recovery keys generated.",
    });
    setStep("backup");
    addToast({
      title: "2FA Verification Verified",
      description: "Two-Factor Authentication is now active.",
      type: "success",
    });
  };

  const handleDisable2FA = () => {
    disableTwoFactor();
    addAuditLog({
      event: "security.2fa_disabled",
      category: "security",
      actor: user?.name || "Admin User",
      actorRole: user?.role === "admin" ? "Admin" : "Billing",
      ipAddress: "192.168.1.42 (US-East)",
      target: "TOTP Authenticator",
      severity: "warning",
      details: "Two-factor authentication disabled for operator session.",
    });
    setIsDisabling(false);
    addToast({
      title: "Two-Factor Disabled",
      description: "Account now requires standard password authentication only.",
      type: "warning",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E8E6E0] shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 relative overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E6E0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF3EE] text-[#2D5A43] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Two-Factor Authentication</h3>
              <p className="text-[11px] text-stone-500">TOTP (Google Authenticator, Authy, 1Password)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* State: 2FA Already Enabled View */}
        {user?.twoFactorEnabled && step !== "backup" ? (
          <div className="mt-5 space-y-5">
            <div className="p-4 rounded-2xl bg-[#EBF3EE]/60 border border-[#D5E3DA] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#2D5A43] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-[#2D5A43]">Active & Enforced</div>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                  Your account is protected with time-based one-time password (TOTP) verification. You will be prompted for a 6-digit code on new sessions.
                </p>
              </div>
            </div>

            {/* Backup codes preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-800">Emergency Recovery Codes</span>
                <span className="text-[10px] font-mono text-stone-400">8 of 8 unused</span>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-[#FAF9F6] p-3 rounded-xl border border-[#E8E6E0]">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="font-mono text-[11px] text-stone-700 bg-white px-2 py-1 rounded border border-[#E8E6E0] text-center">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleCopyBackupCodes}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#FAF9F6] border border-[#E8E6E0] rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
              >
                {copiedBackupCodes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
                <span>{copiedBackupCodes ? "Codes Copied" : "Copy Codes"}</span>
              </button>
              <button
                onClick={handleDownloadBackupCodes}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-[#E8E6E0] rounded-xl text-xs font-semibold text-stone-700 hover:bg-[#FAF9F6] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-stone-400" />
                <span>Download .txt</span>
              </button>
            </div>

            {/* Disable button */}
            <div className="pt-3 border-t border-[#F0EFEA] flex justify-between items-center">
              {isDisabling ? (
                <div className="flex items-center justify-between w-full bg-rose-50 p-3 rounded-xl border border-rose-200">
                  <span className="text-xs text-rose-800 font-medium">Disable 2FA security?</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsDisabling(false)}
                      className="px-2.5 py-1 text-xs text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDisable2FA}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
                    >
                      Confirm Disable
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsDisabling(true)}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold"
                  >
                    Disable Two-Factor Auth
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-[#2D5A43] text-white text-xs font-semibold rounded-xl hover:bg-[#1F4231] transition-colors"
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          </div>
        ) : step === "backup" ? (
          /* Step 3: Display Generated Backup Codes */
          <div className="mt-5 space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-stone-900">2FA Is Now Configured!</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Save your emergency backup recovery codes now. If you lose your mobile device, these single-use codes are the only way to recover access.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E8E6E0]">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, i) => (
                  <div key={i} className="font-mono text-xs text-stone-800 bg-white p-2 rounded-xl border border-[#E8E6E0] text-center font-bold">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyBackupCodes}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-[#FAF9F6] border border-[#E8E6E0] rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
              >
                {copiedBackupCodes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
                <span>{copiedBackupCodes ? "Copied" : "Copy Codes"}</span>
              </button>
              <button
                onClick={handleDownloadBackupCodes}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-white border border-[#E8E6E0] rounded-xl text-xs font-semibold text-stone-700 hover:bg-[#FAF9F6] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-stone-400" />
                <span>Download .txt</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#2D5A43] text-white rounded-xl text-xs font-semibold hover:bg-[#1F4231] shadow-xs transition-colors"
              >
                I have safely stored my backup codes
              </button>
            </div>
          </div>
        ) : (
          /* Step 1 & 2: Setup and QR Code Scan */
          <div className="mt-5 space-y-5">
            {/* Instruction Banner */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E0]">
              <Smartphone className="w-5 h-5 text-[#2D5A43] shrink-0" />
              <p className="text-[11px] text-stone-600">
                Scan this barcode with your authenticator app (Google Authenticator, Microsoft Authenticator, 1Password, or Authy).
              </p>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E0]">
              <div className="p-3 bg-white rounded-2xl border border-[#E8E6E0] shadow-xs shrink-0 flex items-center justify-center">
                {/* Clean SVG QR Code Graphic */}
                <svg width="128" height="128" viewBox="0 0 128 128" className="w-32 h-32 text-stone-900">
                  <rect width="128" height="128" fill="#FFFFFF" rx="4" />
                  {/* Top-left locator */}
                  <rect x="12" y="12" width="28" height="28" rx="4" fill="none" stroke="#2D5A43" strokeWidth="6" />
                  <rect x="20" y="20" width="12" height="12" rx="2" fill="#2D5A43" />
                  {/* Top-right locator */}
                  <rect x="88" y="12" width="28" height="28" rx="4" fill="none" stroke="#2D5A43" strokeWidth="6" />
                  <rect x="96" y="20" width="12" height="12" rx="2" fill="#2D5A43" />
                  {/* Bottom-left locator */}
                  <rect x="12" y="88" width="28" height="28" rx="4" fill="none" stroke="#2D5A43" strokeWidth="6" />
                  <rect x="20" y="96" width="12" height="12" rx="2" fill="#2D5A43" />
                  {/* Dense pattern dots */}
                  <rect x="46" y="16" width="6" height="6" fill="#1A1C1A" rx="1" />
                  <rect x="58" y="16" width="6" height="6" fill="#1A1C1A" rx="1" />
                  <rect x="70" y="16" width="6" height="6" fill="#1A1C1A" rx="1" />
                  <rect x="46" y="28" width="18" height="6" fill="#1A1C1A" rx="1" />
                  <rect x="70" y="28" width="6" height="6" fill="#1A1C1A" rx="1" />
                  <rect x="16" y="46" width="6" height="18" fill="#1A1C1A" rx="1" />
                  <rect x="28" y="46" width="6" height="6" fill="#1A1C1A" rx="1" />
                  <rect x="46" y="46" width="36" height="36" rx="6" fill="#EBF3EE" stroke="#2D5A43" strokeWidth="2" />
                  {/* Center Calyx Emblem */}
                  <circle cx="64" cy="64" r="8" fill="#2D5A43" />
                  <circle cx="64" cy="64" r="4" fill="#A8D5BA" />
                  {/* Bottom right patterns */}
                  <rect x="88" y="46" width="28" height="6" fill="#1A1C1A" rx="1" />
                  <rect x="88" y="58" width="12" height="6" fill="#1A1C1A" rx="1" />
                  <rect x="106" y="58" width="10" height="6" fill="#1A1C1A" rx="1" />
                  <rect x="88" y="70" width="6" height="18" fill="#1A1C1A" rx="1" />
                  <rect x="100" y="70" width="16" height="6" fill="#1A1C1A" rx="1" />
                  <rect x="46" y="88" width="12" height="6" fill="#1A1C1A" rx="1" />
                  <rect x="64" y="88" width="6" height="18" fill="#1A1C1A" rx="1" />
                  <rect x="46" y="100" width="6" height="16" fill="#1A1C1A" rx="1" />
                  <rect x="58" y="106" width="12" height="6" fill="#1A1C1A" rx="1" />
                  <rect x="76" y="96" width="12" height="12" fill="#1A1C1A" rx="2" />
                  <rect x="94" y="96" width="22" height="6" fill="#1A1C1A" rx="1" />
                  <rect x="94" y="108" width="10" height="8" fill="#1A1C1A" rx="1" />
                  <rect x="110" y="108" width="6" height="8" fill="#1A1C1A" rx="1" />
                </svg>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Manual Setup Key
                </span>
                <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-[#E8E6E0]">
                  <code className="text-xs font-mono font-bold text-[#2D5A43] truncate flex-1 select-all">
                    {secretKey}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-stone-400 leading-tight">
                  Issuer: <strong>Calyx Billing</strong> • Algorithm: SHA-1 • Period: 30s
                </p>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerifyAndEnable} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Enter 6-digit confirmation code from authenticator
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value.replace(/\D/g, ""));
                      setCodeError("");
                    }}
                    placeholder="e.g. 849204"
                    className={`w-full px-4 py-2.5 text-center text-lg font-mono tracking-widest rounded-xl bg-[#FAF9F6] border focus:bg-white outline-hidden transition-all ${
                      codeError
                        ? "border-rose-300 focus:border-rose-500 text-rose-700"
                        : "border-[#E8E6E0] focus:border-[#2D5A43] text-stone-900"
                    }`}
                  />
                </div>
                {codeError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{codeError}</p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-[#FAF9F6] border border-[#E8E6E0] rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verificationCode.length !== 6}
                  className="flex-1 py-2.5 bg-[#2D5A43] text-white rounded-xl text-xs font-semibold hover:bg-[#1F4231] shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Verify & Enable
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
