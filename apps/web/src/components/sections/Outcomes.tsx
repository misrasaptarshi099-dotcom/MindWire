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
          {/* Subtle neon glow borders surrounding the outcomes image */}
          <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-primary rounded-2xl blur opacity-20" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative glass p-2 rounded-2xl border border-border/60 overflow-hidden shadow-2xl"
          >
            <img 
              src="/robotics_outcomes.png" 
              alt="Kids collaborating on robot" 
              loading="lazy"
              decoding="async"
              className="w-full h-auto object-cover rounded-xl aspect-[4/3] border border-border/20 hover:scale-[1.01] transition-transform duration-500"
            />
            
            {/* Overlay Gradient for readability of floating card */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />

            {/* Floating certificate card inside the container */}
            <div className="absolute bottom-4 left-4 right-4 glass border border-border/80 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <span className="font-mono text-xs font-bold">M_W</span>
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-glow">MindWire Certified</h3>
                <p className="text-[10px] text-muted-foreground leading-tight">Certificate of Completion awarded to graduates.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
