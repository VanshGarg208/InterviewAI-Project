import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { purchaseCredits } from "../../services/payment";
import { toast } from "sonner";

const plans = [
  {
    planId: "free_tier",
    name: "Free Trial",
    price: "₹0",
    numericPrice: 0,
    credits: 1000,
    period: "welcome bonus",
    features: [
      "1,000 free starter credits",
      "Full technical & HR mock interviews",
      "PDF resume analysis & extraction",
      "Real-time voice TTS & STT",
      "Comprehensive performance reports",
    ],
    cta: "Start Free Practice",
    highlighted: false,
  },
  {
    planId: "pro_tier",
    name: "Pro Interviewer",
    price: "₹499",
    numericPrice: 499,
    credits: 5000,
    period: "/ 5,000 credits",
    features: [
      "5,000 AI practice credits (~100 mock interviews)",
      "Adaptive question difficulty",
      "Instant AI evaluation & scoring",
      "Downloadable PDF interview report",
      "Priority OpenRouter AI processing",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    planId: "mastery_tier",
    name: "Job Mastery Pack",
    price: "₹1,299",
    numericPrice: 1299,
    credits: 15000,
    period: "/ 15,000 credits",
    features: [
      "15,000 AI practice credits (~300 mock interviews)",
      "Everything in Pro",
      "Unlimited resume analyses",
      "Detailed metric breakdowns",
      "Lifetime interview history access",
    ],
    cta: "Get Mastery Pack",
    highlighted: false,
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const card = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const featureItem = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

const PricingSection = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handlePlanClick = (plan: typeof plans[0]) => {
    if (plan.numericPrice === 0) {
      if (user) {
        navigate("/interview");
      } else {
        navigate("/register");
      }
      return;
    }

    if (!user) {
      toast.info("Please sign in or register to purchase credits.", {
        action: {
          label: "Login",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    purchaseCredits({
      planId: plan.planId,
      planName: plan.name,
      amount: plan.numericPrice,
      credits: plan.credits,
      user,
      onSuccess: (updatedUser) => {
        setUser(updatedUser);
      },
    });
  };

  return (
    <section id="pricing" className="section-padding">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">
            Simple, Transparent <span className="text-gradient-primary">Credit Pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Start with 1,000 free credits. Top up only when you need more practice.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-6"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={card}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              className={`rounded-2xl p-6 flex flex-col cursor-default relative overflow-hidden ${
                plan.highlighted
                  ? "glass border-primary/50 shadow-2xl shadow-primary/10 ring-1 ring-primary/40"
                  : "glass border-zinc-800"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-bl-lg border-l border-b border-primary/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold mb-1 font-display">{plan.name}</h3>
              <div className="mb-6 mt-2">
                <span className="text-4xl font-extrabold inline-block text-zinc-100">
                  {plan.price}
                </span>
                <span className="text-muted-foreground text-sm ml-2 font-medium">{plan.period}</span>
              </div>

              <motion.ul
                className="space-y-3 mb-8 flex-1"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } } }}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                {plan.features.map((f) => (
                  <motion.li key={f} variants={featureItem} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-zinc-300">{f}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <div className="w-full">
                <Button
                  variant={plan.highlighted ? "hero" : "heroOutline"}
                  className="w-full h-11"
                  onClick={() => handlePlanClick(plan)}
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
