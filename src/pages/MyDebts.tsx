import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Navigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import ParticleBackground from "@/components/ParticleBackground";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Copy, CreditCard, HeadphonesIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface DebtRecord {
  id: string;
  group_id: string;
  group_name: string;
  seat_numbers: string;
  unique_code: string;
  amount: number;
  total_paid_for_debt: number;
  status: string;
  is_paid: boolean;
}

interface DebtBankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export default function MyDebts() {
  const { isLoggedIn, currentUser } = useApp();
  const [debts, setDebts] = useState<DebtRecord[]>([]);
  const [bankDetails, setBankDetails] = useState<DebtBankDetails | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paySeats, setPaySeats] = useState("");
  const [payCode, setPayCode] = useState("");
  const [payProof, setPayProof] = useState<File | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      const { data } = await supabase.from("user_debts").select("*").eq("user_id", currentUser.id).order("created_at", { ascending: false });
      if (data) setDebts(data as unknown as DebtRecord[]);
      const { data: bankData } = await supabase.from("platform_settings").select("value").eq("key", "debt_bank_details").single();
      if (bankData) {
        try { setBankDetails(JSON.parse((bankData as Record<string, unknown>).value as string)); } catch {}
      }
    };
    load();
  }, [currentUser]);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const submitDebtPayment = async () => {
    if (!currentUser || !paySeats || !payCode) return;
    setPayLoading(true);
    try {
      let screenshotUrl: string | undefined;
      if (payProof) {
        const path = `debt-payments/${currentUser.id}/${Date.now()}_${payProof.name}`;
        const { data: up } = await supabase.storage.from("uploads").upload(path, payProof);
        if (up) { const { data: u } = supabase.storage.from("uploads").getPublicUrl(up.path); screenshotUrl = u.publicUrl; }
      }
      await supabase.from("debt_payments").insert({
        user_id: currentUser.id,
        seat_numbers: paySeats,
        unique_codes: payCode,
        screenshot_url: screenshotUrl || null,
        amount: 0,
      });
      toast.success("Debt payment submitted! Waiting for admin approval.");
      setShowPayment(false); setPaySeats(""); setPayCode(""); setPayProof(null);
    } catch { toast.error("Failed to submit payment"); }
    setPayLoading(false);
  };

  return (
    <DashboardLayout>
      <ParticleBackground />
      <div className="px-4 md:px-6 py-6 relative z-10">
        <div className="mb-6 animate-fade-up">
          <h1 className="gold-gradient-text text-3xl font-cinzel font-bold flex items-center gap-2"><AlertTriangle size={24} /> My Debts</h1>
          <p className="text-muted-foreground text-sm mt-1">View and manage your outstanding debts</p>
        </div>

        {/* Instructions */}
        <div className="glass-card-static rounded-2xl p-5 border border-amber-600/20 bg-amber-900/5 mb-6 animate-fade-up">
          <p className="text-amber-400 font-bold text-sm mb-3">To ensure your payment is processed quickly and accurately, please follow these steps:</p>
          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
            <div>
              <p className="text-gold font-bold uppercase mb-1">OPTION 1: DIRECT PAYMENT</p>
              <p><strong className="text-foreground">COPY YOUR DETAILS:</strong> Copy the Seat Unique Code and the specific Seat Numbers associated with your debt.</p>
              <p><strong className="text-foreground">Initiate Payment:</strong> Click the "Make Payment" button. You will be redirected to the secure payment gateway.</p>
              <p><strong className="text-foreground">ADD NARRATION:</strong> While completing the transaction, you must include your Unique Code in the payment narration/memo field.</p>
              <p><strong className="text-foreground">UPLOAD PROOF:</strong> Once finished, attach your payment receipt (screenshot) and click "I've made payment" to submit for verification.</p>
            </div>
            <div>
              <p className="text-gold font-bold uppercase mb-1">OPTION 2: MANUAL BANK TRANSFER</p>
              <p><strong className="text-foreground">OPEN A TICKET:</strong> Create a support ticket requesting the admin specific bank details.</p>
              <p><strong className="text-foreground">PROVIDE INFO:</strong> In your request, include your Unique Code and specify if you want the details sent via email or SMS.</p>
              <p><strong className="text-foreground">SUBMIT EVIDENCE:</strong> After transferring the funds, send a screenshot of the receipt directly to the ticket report. An administrator will manually verify and update your status.</p>
            </div>
            <p className="text-amber-400 font-semibold">⚠️ NOTE: Always double-check that your Unique Code is included in the narration to avoid delays in clearing your debt.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6 animate-fade-up">
          <button onClick={() => setShowPayment(true)} className="btn-gold px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
            <CreditCard size={14} /> Make Payment
          </button>
          <Link to="/support" className="btn-glass px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
            <HeadphonesIcon size={14} /> Contact Support
          </Link>
        </div>

        {/* Payment Modal */}
        {showPayment && (
          <div className="glass-card-static rounded-2xl p-5 border border-gold/20 mb-6 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="gold-text font-cinzel font-bold">Make Debt Payment</h3>
              <button onClick={() => setShowPayment(false)}><X size={16} className="text-muted-foreground" /></button>
            </div>
            {bankDetails && (
              <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 mb-4 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Transfer To:</p>
                <p className="text-foreground font-bold">{bankDetails.accountName}</p>
                <div className="flex items-center gap-2">
                  <p className="text-gold font-mono text-lg">{bankDetails.accountNumber}</p>
                  <button onClick={() => copyToClipboard(bankDetails.accountNumber)} className="text-muted-foreground hover:text-gold"><Copy size={12} /></button>
                </div>
                <p className="text-muted-foreground">{bankDetails.bankName}</p>
              </div>
            )}
            <div className="space-y-3">
              <div><label className="luxury-label">Seat Numbers (e.g. S1+S3) *</label><input value={paySeats} onChange={e => setPaySeats(e.target.value)} placeholder="S1+S3+S6" className="luxury-input" /></div>
              <div><label className="luxury-label">Seat Unique Code(s) *</label><input value={payCode} onChange={e => setPayCode(e.target.value)} placeholder="Enter unique code" className="luxury-input" /></div>
              <div>
                <label className="luxury-label">Payment Proof (Screenshot) *</label>
                <label className="btn-glass px-4 py-2 rounded-xl text-sm cursor-pointer flex items-center gap-2 w-fit">
                  <Upload size={14} />{payProof ? payProof.name : "Choose File"}
                  <input type="file" className="hidden" onChange={e => setPayProof(e.target.files?.[0] || null)} accept="image/*,.pdf" />
                </label>
              </div>
              <button onClick={submitDebtPayment} disabled={payLoading || !paySeats || !payCode || !payProof} className="btn-gold w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50">
                {payLoading ? "Submitting..." : "I've Made Payment"}
              </button>
            </div>
          </div>
        )}

        {/* Debts Table */}
        <div className="glass-card-static rounded-2xl overflow-hidden animate-fade-up">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gold/10 bg-gold/5">
                {["Group", "Seats", "Unique Code", "Amount Owed", "Status"].map(h => <th key={h} className="px-3 py-2 text-left text-muted-foreground font-semibold uppercase text-[9px]">{h}</th>)}
              </tr></thead>
              <tbody>
                {debts.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">
                    <AlertTriangle size={32} className="mx-auto mb-2 opacity-30" />
                    No debts found. You're all clear! 🎉
                  </td></tr>
                ) : debts.map(d => (
                  <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-2 font-semibold">{d.group_name || "Unknown Group"}</td>
                    <td className="px-3 py-2 text-gold font-mono">{d.seat_numbers || "-"}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[10px] text-amber-400">{d.unique_code || "-"}</span>
                        {d.unique_code && <button onClick={() => copyToClipboard(d.unique_code)} className="text-muted-foreground hover:text-gold"><Copy size={10} /></button>}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-red-400 font-bold">₦{Number(d.amount).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${d.status === "cleared" ? "text-emerald-400 border-emerald-600/30 bg-emerald-900/20" : d.status === "removed" ? "text-blue-400 border-blue-600/30 bg-blue-900/20" : "text-red-400 border-red-600/30 bg-red-900/20"}`}>
                        {d.status === "cleared" ? "Cleared" : d.status === "removed" ? "Removed Debt" : "Not Cleared"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
