import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  CreditCard,
  Hash,
  LogOut,
  ArrowLeft,
  Edit3,
  CheckCircle2,
  Lock,
  Loader2,
  Clock,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import api from "../services/api";
import { purchaseCredits } from "../services/payment";
import { toast } from "sonner";

interface PaymentRecord {
  _id: string;
  planId: string;
  amount: number;
  credits: number;
  razorpayOrderId: string;
  status: string;
  createdAt: string;
}

const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Payment History State
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
    }
  }, [user]);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoadingPayments(true);
      try {
        const { data } = await api.get("/payment/history");
        setPayments(data);
      } catch (err) {
        console.warn("Could not fetch payment history:", err);
      } finally {
        setLoadingPayments(false);
      }
    };
    fetchPayments();
  }, []);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }
    if (newPassword && !currentPassword) {
      toast.error("Current password is required to set a new password.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = { name: editName.trim() };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const { data } = await api.put("/user/profile", payload);
      setUser(data.user);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Failed to update profile.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickTopUp = () => {
    purchaseCredits({
      planId: "pro_tier",
      planName: "Pro Pack",
      amount: 499,
      credits: 5000,
      user,
      onSuccess: (updatedUser) => {
        setUser(updatedUser);
        // Refresh payment history
        api.get("/payment/history").then((res) => setPayments(res.data)).catch(() => {});
      },
    });
  };

  const userInfo = [
    { label: "Full Name", value: user.name, icon: User },
    { label: "Email Address", value: user.email, icon: Mail },
    { label: "Available Credits", value: user.credits.toString(), icon: CreditCard },
    { label: "Account ID", value: user._id, icon: Hash },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <Navbar />

      {/* Decorative background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <main className="flex-1 container mx-auto max-w-4xl px-6 pt-32 pb-16 relative z-10 flex flex-col">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center justify-between"
        >
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-zinc-900/60 px-3 py-1 rounded-full border border-zinc-800">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Session Active
          </span>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left Column: Avatar & Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full md:w-1/3 glass rounded-2xl p-8 flex flex-col items-center text-center border border-white/5"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent p-1 mb-6 shadow-xl shadow-primary/20">
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center border-4 border-background">
                <User className="w-12 h-12 text-zinc-400" />
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-1 tracking-tight text-zinc-100">{user.name}</h1>
            <p className="text-muted-foreground text-sm mb-6">{user.email}</p>

            <div className="w-full h-px bg-white/5 mb-6" />

            <div className="w-full bg-zinc-900/50 rounded-xl p-4 border border-white/5 mb-6 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground font-medium">Credits Balance</span>
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-extrabold text-primary">{user.credits}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickTopUp}
                className="w-full mt-3 border-primary/40 text-primary hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> Top Up Credits
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full mb-3 border-zinc-700 text-zinc-300 hover:text-white"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? "Close Form" : "Edit Profile"}
            </Button>

            <Button variant="destructive" className="w-full mt-auto" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>

          {/* Right Column */}
          <div className="w-full md:w-2/3 space-y-6">
            {/* Edit Profile Form */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass rounded-xl p-6 border border-primary/40"
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-zinc-100">
                  <Edit3 className="w-5 h-5 text-primary" /> Edit Profile & Security
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-400">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="mt-1 w-full bg-zinc-900/80 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-zinc-100 outline-none focus:border-primary transition"
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="pt-2 border-t border-zinc-800">
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Change Password (optional)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-zinc-400">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="mt-1 w-full bg-zinc-900/80 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-zinc-100 outline-none focus:border-primary transition"
                          placeholder="Current password"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-400">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="mt-1 w-full bg-zinc-900/80 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-zinc-100 outline-none focus:border-primary transition"
                          placeholder="New password (min 6 chars)"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="hero" size="sm" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Info Grid */}
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userInfo.map((info, idx) => (
                <motion.div
                  key={idx}
                  variants={item}
                  className="glass rounded-xl p-6 border border-white/5 hover:border-primary/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-900/80 flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 group-hover:border-primary/50 transition-all">
                    <info.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{info.label}</h3>
                  <p className="text-lg font-semibold truncate text-zinc-200" title={info.value}>
                    {info.value}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Payment & Credit History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Payment History
                </h3>
                <span className="text-xs text-muted-foreground">{payments.length} transaction(s)</span>
              </div>

              {loadingPayments ? (
                <p className="text-sm text-zinc-500 py-4 text-center">Loading transactions...</p>
              ) : payments.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-zinc-800 rounded-lg">
                  <p className="text-sm text-zinc-400">No payment transactions yet.</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Free starter credits were automatically granted on sign up.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {payments.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-zinc-200 uppercase">{p.planId}</p>
                        <p className="text-zinc-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-bold">+{p.credits} credits</p>
                        <p className="text-zinc-400 font-medium">₹{p.amount} • {p.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div variants={item} className="glass rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <Link to="/interview">
                  <Button variant="hero">Start New Interview</Button>
                </Link>
                <Link to="/history">
                  <Button variant="heroOutline">View Interview Archives</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
