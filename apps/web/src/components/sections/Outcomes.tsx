import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const outcomes = [
  "Build a working AI image classifier using Teachable Machine",
  "Program a robotic arm simulation in Scratch + Python",
  "Understand how neural networks learn with visual explainers",
  "Create a basic voice-activated smart assistant",
  "Collaborate on a final showcase project",
  "Receive a portfolio-ready project report & Certificate"
];

export function Outcomes() {
  return (
    <section className="py-24 bg-muted/20 relative">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Real Skills. Real Results.</h2>
          <p className="text-lg text-muted-foreground mb-8">
            This isn't just theory. By the end of the 4 weeks, your child will have a portfolio of working technical projects.
          </p>
          <ul className="space-y-4">
            {outcomes.map((outcome, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/90">{outcome}</span>
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="aspect-square rounded-2xl glass p-8 flex flex-col items-center justify-center text-center border-primary/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-50" />
            <div className="z-10">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                <span className="font-mono text-2xl text-primary font-bold">M_W</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">MindWire Certified</h3>
              <p className="text-muted-foreground text-sm">Certificate of Completion awarded to all successful graduates.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
