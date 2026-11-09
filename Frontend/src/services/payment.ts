import api from "./api";
import { toast } from "sonner";
import { User } from "../context/AuthContext";

// Dynamically load the official Razorpay SDK script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export interface PurchasePlanParams {
  planId: string;
  planName: string;
  amount: number;
  credits: number;
  user: User;
  onSuccess: (updatedUser: User) => void;
}

export const purchaseCredits = async ({
  planId,
  planName,
  amount,
  credits,
  user,
  onSuccess,
}: PurchasePlanParams) => {
  try {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error("Could not load payment gateway. Please check your internet connection.");
      return;
    }

    toast.loading("Initiating secure payment order...", { id: "payment-toast" });

    // 1. Create order on backend
    const { data: order } = await api.post("/payment/order", {
      planId,
      amount,
      credits,
    });

    toast.dismiss("payment-toast");

    // 2. Open Razorpay Checkout modal
    const options = {
      key: order.keyId || (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || "rzp_test_placeholder",
      amount: order.amount,
      currency: order.currency || "INR",
      name: "InterviewAI",
      description: `${planName} (${credits} AI Credits)`,
      order_id: order.id,
      prefill: {
        name: user.name,
        email: user.email,
      },
      theme: {
        color: "#10b981", // primary emerald
      },
      handler: async (response: any) => {
        try {
          toast.loading("Verifying transaction with server...", { id: "verify-toast" });

          // 3. Server-side verification
          const { data: verifyData } = await api.post("/payment/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          toast.dismiss("verify-toast");

          if (verifyData.success) {
            toast.success(`Payment verified! ${credits} credits added to your account.`);
            if (verifyData.user) {
              onSuccess(verifyData.user);
            }
          } else {
            toast.error(verifyData.message || "Payment verification failed.");
          }
        } catch (verifyError: any) {
          toast.dismiss("verify-toast");
          console.error("Payment verification failed:", verifyError);
          toast.error(verifyError.response?.data?.message || "Failed to verify payment with server.");
        }
      },
      modal: {
        ondismiss: () => {
          toast.info("Payment was cancelled.");
        },
      },
    };

    const razorpayModal = new (window as any).Razorpay(options);
    razorpayModal.on("payment.failed", (failedRes: any) => {
      console.error("Razorpay payment failed:", failedRes.error);
      toast.error(`Payment failed: ${failedRes.error?.description || "Transaction declined"}`);
    });
    razorpayModal.open();
  } catch (error: any) {
    toast.dismiss("payment-toast");
    console.error("Payment initialization failed:", error);
    const msg = error.response?.data?.message || error.message || "Failed to initiate payment.";
    toast.error(msg, { duration: 6000 });
  }
};

