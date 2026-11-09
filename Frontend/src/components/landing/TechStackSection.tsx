import { motion } from "framer-motion";

const stack = [
  { name: "React", category: "Frontend" },
  { name: "TypeScript", category: "Language" },
  { name: "Node.js", category: "Backend" },
  { name: "OpenAI", category: "AI Engine" },
  { name: "PostgreSQL", category: "Database" },
  { name: "WebRTC", category: "Real-time" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const chip = {
  hidden: { opacity: 0, scale: 0.7, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const TechStackSection = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powered by modern <span className="text-gradient-primary">technology</span>
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4"
        >
          {stack.map((t) => (
            <motion.div
              key={t.name}
              variants={chip}
              whileHover={{
                scale: 1.1,
                y: -4,
                transition: { duration: 0.2 },
              }}
              className="glass rounded-lg px-5 py-3 text-center cursor-default hover:border-primary/30 transition-colors"
            >
              <p className="font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.category}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TechStackSection;
