import { motion } from "framer-motion";
import { Brain, MessageSquareText, BarChart3, History, Code2, Users } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Interview Simulation",
    description: "Realistic mock interviews powered by advanced AI. Coding, system design, and behavioral rounds—just like the real thing.",
  },
  {
    icon: MessageSquareText,
    title: "Intelligent Feedback",
    description: "Line-by-line code review, communication scoring, and personalized improvement tips after every session.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track your progress across problem-solving speed, code quality, and communication clarity with detailed dashboards.",
  },
  {
    icon: History,
    title: "Interview History",
    description: "Review past sessions, revisit AI feedback, and measure improvement over time with full session recordings.",
  },
  {
    icon: Code2,
    title: "Multi-Language Support",
    description: "Practice in Python, JavaScript, Java, Go, and more. Our AI adapts to your preferred language and framework.",
  },
  {
    icon: Users,
    title: "Role-Specific Prep",
    description: "Tailored question banks for frontend, backend, ML, data engineering, and DevOps roles at every seniority level.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="section-padding">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Everything you need to <span className="text-gradient-primary">prepare</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            A complete interview preparation platform that goes beyond flashcards and leetcode grinding.
          </motion.p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              whileHover={{
                y: -6,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              className="glass rounded-xl p-6 group hover:border-primary/30 transition-colors duration-300 cursor-default"
            >
              <motion.div
                className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }}
              >
                <feature.icon className="w-5 h-5 text-primary" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
