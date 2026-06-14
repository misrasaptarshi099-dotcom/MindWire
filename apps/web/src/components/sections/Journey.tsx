import { motion } from 'framer-motion';
import { Terminal, Cpu, Network, Rocket } from 'lucide-react';

const weeks = [
  {
    number: 1,
    title: "The Foundation",
    description: "Introduction to coding logic and hardware basics.",
    icon: <Terminal className="w-6 h-6 text-primary" />
  },
  {
    number: 2,
    title: "Machine Brains",
    description: "Training their first AI models using Teachable Machine.",
    icon: <Cpu className="w-6 h-6 text-primary" />
  },
  {
    number: 3,
    title: "Neural Networks",
    description: "Understanding how algorithms process information.",
    icon: <Network className="w-6 h-6 text-primary" />
  },
  {
    number: 4,
    title: "The Final Build",
    description: "Collaborative project showcase and graduation.",
    icon: <Rocket className="w-6 h-6 text-primary" />
  }
];

export function Journey() {
  return (
    <section className="py-24 relative">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">The Journey</h2>
          <p className="text-lg text-muted-foreground">4 weeks to transform curiosity into capability.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {weeks.map((week, index) => (
            <motion.div
              key={week.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass p-6 rounded-2xl relative border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                {week.icon}
              </div>
              <div className="text-primary text-sm font-mono font-bold mb-2">WEEK 0{week.number}</div>
              <h3 className="text-xl font-bold mb-3">{week.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{week.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
