"use client";

import React, { useState } from "react";
import { useUIState } from "@/context/UIStateContext";
import { WEBHOOK_TEMPLATES, WebhookTemplate } from "@/lib/data";
import {
  Code2,
  Play,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Key,
  Globe,
  RefreshCw,
  Send,
} from "lucide-react";

export default function DevelopersPage() {
  const { dispatchWebhookSimulation, addToast, dispatchedEventsCount } = useUIState();

  const [selectedTemplateId, setSelectedTemplateId] = useState(WEBHOOK_TEMPLATES[0].id);
  const [isDispatching, setIsDispatching] = useState(false);
  const [lastDispatchedResult, setLastDispatchedResult] = useState<{
    status: number;
    responseTimeMs: number;
    signature: string;
    payload: Record<string, unknown>;
  } | null>(null);

  // API Keys state
  const [showLiveKey, setShowLiveKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("https://api.your-company.com/v1/calyx/webhook");

  const activeTemplate =
    WEBHOOK_TEMPLATES.find((t) => t.id === selectedTemplateId) || WEBHOOK_TEMPLATES[0];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(label);
    addToast({
      title: "Copied to Clipboard",
      description: `${label} copied.`,
      type: "success",
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTriggerWebhook = async () => {
    setIsDispatching(true);
    try {
      const res = await dispatchWebhookSimulation(selectedTemplateId);
      setLastDispatchedResult({
        status: 200,
        responseTimeMs: res.responseTimeMs,
        signature: res.signature,
        payload: res.template.defaultPayload,
      });

      addToast({
        title: `Webhook Dispatched (200 OK)`,
        description: `Delivered ${res.template.eventType} in ${res.responseTimeMs}ms. Ledger & audit trail updated!`,
        type: "success",
      });
    } catch {
      addToast({
        title: "Dispatch Failed",
        description: "Could not trigger simulated webhook event.",
        type: "error",
      });
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <span>Synthetix AI</span>
          <span>/</span>
          <span className="text-stone-900 font-semibold">Developers</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
          Webhook Simulator & API Console
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Test real-time billing pipeline integrations, dispatch simulated webhooks, and manage API credentials.
        </p>
      </div>

      {/* API Credentials Card */}
      <div className="bg-white rounded-2xl border border-[#E8E6E0] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EFEA]">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#2D5A43]" />
              <span>Workspace API Credentials</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Use these secret keys to authenticate server-side SDKs and programmatic invoice queries.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
            API v2026.03 Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Live Secret Key */}
          <div className="bg-[#FAF9F6] border border-[#E8E6E0] p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800">Production Secret Key</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold">
                LIVE
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-[#E8E6E0] rounded-lg px-3 py-2">
              <input
                type={showLiveKey ? "text" : "password"}
                readOnly
                value="cx_live_9482710385710928a3f8"
                className="w-full font-mono text-[11px] text-stone-700 bg-transparent outline-hidden"
              />
              <button
                onClick={() => setShowLiveKey(!showLiveKey)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
                title={showLiveKey ? "Hide key" : "Reveal key"}
              >
                {showLiveKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleCopy("cx_live_9482710385710928a3f8", "Live API Key")}
                className="text-stone-400 hover:text-[#2D5A43] cursor-pointer"
                title="Copy API key"
              >
                {copiedKey === "Live API Key" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Test Secret Key */}
          <div className="bg-[#FAF9F6] border border-[#E8E6E0] p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800">Sandbox / Test Secret Key</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono font-bold">
                TEST
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-[#E8E6E0] rounded-lg px-3 py-2">
              <input
                type="text"
                readOnly
                value="cx_test_8471920481750192e2b1"
                className="w-full font-mono text-[11px] text-stone-700 bg-transparent outline-hidden"
              />
              <button
                onClick={() => handleCopy("cx_test_8471920481750192e2b1", "Test API Key")}
                className="text-stone-400 hover:text-[#2D5A43] cursor-pointer"
                title="Copy test key"
              >
                {copiedKey === "Test API Key" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Interactive Test Bench */}
      <div className="bg-white rounded-2xl border border-[#E8E6E0] overflow-hidden shadow-xs">
        <div className="p-6 border-b border-[#E8E6E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF9F6]">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#2D5A43]" />
              <span>Interactive Webhook Test Bench</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Select an event and click Dispatch to trigger real-time ledger updates and audit entries.
            </p>
          </div>

          <button
            onClick={handleTriggerWebhook}
            disabled={isDispatching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A43] text-white hover:bg-[#1F4231] active:bg-[#163023] text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60 self-start sm:self-auto"
          >
            {isDispatching ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Network Delivery...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Dispatch &quot;{activeTemplate.eventType}&quot; Event</span>
              </>
            )}
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* Left Column: Event Selector & Config */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <label className="block font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-2">
                Available Event Types
              </label>
              <div className="space-y-2">
                {WEBHOOK_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplateId(tmpl.id);
                      setLastDispatchedResult(null);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedTemplateId === tmpl.id
                        ? "border-[#2D5A43] bg-emerald-50/60 ring-1 ring-[#2D5A43]"
                        : "border-[#E8E6E0] bg-white hover:bg-[#FAF9F6]"
                    }`}
                  >
                    <div className="font-mono font-bold text-stone-900 text-[11px]">
                      {tmpl.eventType}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                      {tmpl.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#FAF9F6] border border-[#E8E6E0] p-4 rounded-xl space-y-2">
              <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">
                Endpoint Destination
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-600">
                <Globe className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-white border border-[#E8E6E0] rounded-lg px-2.5 py-1.5 font-mono text-[10px] text-stone-800 outline-hidden focus:border-[#2D5A43]"
                />
              </div>
              <p className="text-[10px] text-stone-400 leading-relaxed">
                Events sent with header <code className="bg-stone-200 px-1 py-0.2 rounded text-[10px]">Calyx-Signature</code>.
              </p>
            </div>
          </div>

          {/* Right Column: Live Payload Viewer & Delivery Inspector */}
          <div className="lg:col-span-8 space-y-4">
            {/* Status & Signature banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-stone-900 text-white rounded-xl font-mono text-[11px]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lastDispatchedResult
                    ? `STATUS ${lastDispatchedResult.status} OK`
                    : "READY TO DISPATCH"}
                </span>
                {lastDispatchedResult && (
                  <span className="text-stone-400">
                    Latency: <strong>{lastDispatchedResult.responseTimeMs}ms</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-stone-400 text-[10px] truncate max-w-[200px]">
                  {lastDispatchedResult ? lastDispatchedResult.signature : "Signature: HMAC-SHA256"}
                </span>
                <button
                  onClick={() =>
                    handleCopy(
                      JSON.stringify(activeTemplate.defaultPayload, null, 2),
                      "Webhook JSON Payload"
                    )
                  }
                  className="p-1 rounded hover:bg-stone-800 text-stone-300 transition-colors"
                  title="Copy JSON Payload"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Syntax-highlighted JSON Viewer */}
            <div className="border border-[#E8E6E0] rounded-2xl overflow-hidden bg-[#1E1E1E]">
              <div className="px-4 py-2 bg-[#2D2D2D] border-b border-[#3D3D3D] flex items-center justify-between text-[11px] text-stone-300 font-mono">
                <span>payload.json ({activeTemplate.eventType})</span>
                <span className="text-stone-400">Content-Type: application/json</span>
              </div>
              <pre className="p-4 text-emerald-300 font-mono text-xs overflow-x-auto max-h-[380px] scrollbar-thin">
                {JSON.stringify(
                  lastDispatchedResult ? lastDispatchedResult.payload : activeTemplate.defaultPayload,
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
