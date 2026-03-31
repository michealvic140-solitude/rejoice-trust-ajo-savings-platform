import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ParticleBackground from "@/components/ParticleBackground";
import { CheckCircle, X, DollarSign, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface DebtPayment {
  id: string;
  user_id: string;
  debt_id: string | null;
  amount: number;
  seat_numbers: string;
  unique_codes: string;
  screenshot_url: string | null;
  status: string;
  declined_reason: string | null;
  created_at: string;
}

export default function DebtPayments() {
  const { currentUser, isLoggedIn, loading } = useApp();
  const isAdmin = currentUser?.role === "admin";
  const [payments, setPayments] = useState<DebtPayment[]>([]);
  const [users, setUsers] = useState<Record<string, Record<string, unknown>>>({});
  const [bankName, setBankName] = useState("");
  const [bankAccNum, setBankAccNum] = useState("");
  const [bankAccName, setBankAccName] = useState("");

  const loadData = useCallback(async () => {
    const { data } = await (supabase as any).from("debt_payments").select("*").order("created_at", { ascending: false });
    if (data) setPayments(data as unknown as DebtPayment[]);
    const { data: bankData } = await supabase.from("platform_settings").select("value").eq("key", "debt_bank_details").single();
    if (bankData) {
      try {
        const parsed = JSON.parse((bankData as Record<string, unknown>).value as string);
        setBankName(parsed.bankName || "");
        setBankAccNum(parsed.accountNumber || "");
        setBankAccName(parsed.accountName || "");
      } catch {}
    }
    // Load user profiles for display
    const { data: profilesData } = await supabase.from("profiles").select("id, username, first_name, last_name, email, phone");
    if (profilesData) {
      const map: Record<string, Record<string, unknown>> = {};
      profilesData.forEach((p: Record<string, unknown>) => { map[p.id as string] = p; });
      setUsers(map);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-gold font-cinzel text-lg animate-pulse">Loading...</div></div>;
  if (!isLoggedIn || !isAdmin) return <Navigate to="/" replace />;

  const saveBankDetails = async () => {
    const val = JSON.stringify({ bankName, accountNumber: bankAccNum, accountName: bankAccName });
    const { data: existing } = await supabase.from("platform_settings").select("id").eq("key", "debt_bank_details").single();
    if (existing) {
      await supabase.from("platform_settings").update({ value: val }).eq("key", "debt_bank_details");
    } else {
      await supabase.from("platform_settings").insert({ key: "debt_bank_details", value: val });
    }
    toast.success("Debt bank details saved!");
  };

  const approveDebtPayment = async (paymentId: string, userId: string) => {
    await (supabase as any).from("debt_payments").update({ status: "approved" }).eq("id", paymentId);
    await supabase.rpc("send_notification_to_user", { p_user_id: userId, p_message: "Your debt payment has been approved! ✅" });
    await supabase.from("audit_logs").insert({ admin_id: currentUser!.id, admin_name: currentUser!.username, user_id: userId, action: `Approved debt payment ${paymentId}`, type: "debt" });
    await loadData();
  };

  const declineDebtPayment = async (paymentId: string, userId: string) => {
    const reason = prompt("Reason for declining:");
    await supabase.from("debt_payments").update({ status: "declined", declined_reason: reason || null }).eq("id", paymentId);
    await supabase.rpc("send_notification_to_user", { p_user_id: userId, p_message: `Your debt payment was declined.${reason ? ` Reason: ${reason}` : ""}` });
    await loadData();
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 relative">
      <ParticleBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="gold-gradient-text text-3xl font-cinzel font-bold flex items-center gap-2"><DollarSign size={24} /> Debt Payments</h1>
          <button onClick={loadData} className="btn-glass px-3 py-2 rounded-xl text-xs flex items-center gap-1"><RefreshCw size={12} /> Refresh</button>
        </div>

        {/* Bank Details Config */}
        <div className="glass-card-static rounded-2xl p-5 border border-gold/20 mb-6">
          <h3 className="gold-text font-cinzel font-bold mb-3">Debt Payment Bank Details</h3>
          <p className="text-muted-foreground text-xs mb-3">These bank details will be displayed on all users' "My Debts" page.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className="luxury-label">Bank Name</label><input value={bankName} onChange={e => setBankName(e.target.value)} className="luxury-input" /></div>
            <div><label className="luxury-label">Account Number</label><input value={bankAccNum} onChange={e => setBankAccNum(e.target.value)} className="luxury-input" /></div>
            <div><label className="luxury-label">Account Name</label><input value={bankAccName} onChange={e => setBankAccName(e.target.value)} className="luxury-input" /></div>
          </div>
          <button onClick={saveBankDetails} className="btn-gold px-4 py-2 rounded-xl text-xs font-bold mt-3 flex items-center gap-1"><Save size={12} /> Save Bank Details</button>
        </div>

        {/* Payments Table */}
        <div className="glass-card-static rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gold/10 bg-gold/5">
                {["User", "Seats", "Unique Code", "Proof", "Status", "Date", "Actions"].map(h => <th key={h} className="px-3 py-2 text-left text-muted-foreground font-semibold uppercase text-[9px]">{h}</th>)}
              </tr></thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No debt payments yet</td></tr>
                ) : payments.map(p => {
                  const user = users[p.user_id];
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-3 py-2">
                        <p className="text-gold font-mono">@{user?.username as string || "unknown"}</p>
                        <p className="text-muted-foreground text-[9px]">{user?.first_name as string} {user?.last_name as string}</p>
                      </td>
                      <td className="px-3 py-2 font-mono">{p.seat_numbers || "-"}</td>
                      <td className="px-3 py-2 text-amber-400 font-mono text-[10px]">{p.unique_codes || "-"}</td>
                      <td className="px-3 py-2">{p.screenshot_url ? <a href={p.screenshot_url} target="_blank" rel="noreferrer" className="text-blue-400 underline text-[10px]">View</a> : "-"}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${p.status === "pending" ? "text-amber-400 border-amber-600/30 bg-amber-900/20" : p.status === "approved" ? "text-emerald-400 border-emerald-600/30 bg-emerald-900/20" : "text-red-400 border-red-600/30 bg-red-900/20"}`}>{p.status}</span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground text-[9px]">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="px-3 py-2">
                        {p.status === "pending" && (
                          <div className="flex gap-1">
                            <button onClick={() => approveDebtPayment(p.id, p.user_id)} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg border border-emerald-600/30 bg-emerald-900/15 text-emerald-400 hover:bg-emerald-900/30"><CheckCircle size={9} />Approve</button>
                            <button onClick={() => declineDebtPayment(p.id, p.user_id)} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg border border-red-600/30 bg-red-900/15 text-red-400 hover:bg-red-900/30"><X size={9} />Decline</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
