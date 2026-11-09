import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const steps = [
  { step: "01", title: "Choose Your Focus", description: "Select a role, difficulty level, and interview type—coding, system design, or behavioral." },
  { step: "02", title: "Start the Session", description: "Our AI interviewer presents problems in real-time, just like a live interview at a top company." },
  { step: "03", title: "Get Instant Feedback", description: "Receive detailed scoring on code quality, problem-solving approach, and communication skills." },
  { step: "04", title: "Track & Improve", description: "Review your analytics dashboard, identify weak areas, and watch your performance grow over time." },
];

const TimelineStep = ({ s, i, total }: { s: typeof steps[0]; i: number; total: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const dotScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1, 1]);
  const dotOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.3, 1, 1]);
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={ref} className="relative flex items-start gap-6 md:gap-0">
      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-[1fr_80px_1fr] w-full items-start">
        {/* Left content */}
        <div className={`${i % 2 === 0 ? "text-right pr-8" : ""}`}>
          {i % 2 === 0 && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-sm ml-auto"
            >
              <p className="text-primary font-mono text-sm mb-1">{s.step}</p>
              <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.description}</p>
            </motion.div>
          )}
        </div>

        {/* Center dot + animated line */}
        <div className="flex flex-col items-center relative">
          <motion.div
            style={{ scale: dotScale, opacity: dotOpacity }}
            className="relative z-10 w-12 h-12 rounded-full bg-secondary border-2 border-primary/40 flex items-center justify-center"
          >
            <motion.span
              className="text-primary font-mono text-sm font-bold"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {s.step}
            </motion.span>
          </motion.div>
          {/* Animated connector line */}
          {i < total - 1 && (
            <div className="w-px h-24 bg-border relative overflow-hidden">
              <motion.div
                className="absolute inset-x-0 top-0 bg-primary/60"
                style={{ height: lineHeight }}
              />
            </div>
          )}
        </div>

        {/* Right content */}
        <div className={`${i % 2 !== 0 ? "pl-8" : ""}`}>
          {i % 2 !== 0 && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-sm"
            >
              <p className="text-primary font-mono text-sm mb-1">{s.step}</p>
              <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.description}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex items-start gap-4">
        <motion.div
          style={{ scale: dotScale, opacity: dotOpacity }}
          className="relative z-10 w-12 h-12 rounded-full bg-secondary border-2 border-primary/40 flex items-center justify-center shrink-0"
        >
          <span className="text-primary font-mono text-sm font-bold">{s.step}</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex-1 pb-8"
        >
          <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
          <p className="text-muted-foreground text-sm">{s.description}</p>
        </motion.div>
      </div>
    </div>
  );
};

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-padding">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How it <span className="text-gradient-primary">works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From zero to interview-ready in four simple steps.
          </p>
        </motion.div>

        <div className="relative">
          {/* Static background line (mobile) */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border md:hidden" />

          <div className="space-y-4 md:space-y-0">
            {steps.map((s, i) => (
              <TimelineStep key={s.step} s={s} i={i} total={steps.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
