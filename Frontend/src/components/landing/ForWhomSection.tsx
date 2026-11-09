import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Rocket, RefreshCw } from "lucide-react";

const personas = [
  { icon: GraduationCap, title: "New Graduates", description: "Build confidence before your first technical interview. Practice fundamentals with guided difficulty progression." },
  { icon: Briefcase, title: "Mid-Level Engineers", description: "Level up for senior roles. Master system design, leadership scenarios, and complex algorithmic problems." },
  { icon: Rocket, title: "Career Switchers", description: "Transitioning into tech? Get structured practice that fills knowledge gaps and builds interview muscle memory." },
  { icon: RefreshCw, title: "Returning Professionals", description: "Refreshing after a career break? Quickly get back to interview-ready with adaptive difficulty sessions." },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const card = {
  hidden: { opacity: 0, y: 40, rotateX: 8 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const ForWhomSection = () => {
  return (
    <section id="for-whom" className="section-padding">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Built for <span className="text-gradient-primary">every engineer</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Whether you're starting out or aiming for staff-level, we adapt to your journey.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          style={{ perspective: "800px" }}
        >
          {personas.map((p) => (
            <motion.div
              key={p.title}
              variants={card}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              className="glass rounded-xl p-6 text-center group hover:border-accent/30 transition-colors cursor-default"
            >
              <motion.div
                className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors"
                whileHover={{ scale: 1.15, rotate: 10, transition: { duration: 0.3 } }}
              >
                <p.icon className="w-5 h-5 text-accent" />
              </motion.div>
              <h3 className="font-semibold mb-2">{p.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{p.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ForWhomSection;
