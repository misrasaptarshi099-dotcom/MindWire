import { motion } from 'framer-motion';

export function Spark() {
  return (
    <section className="py-24 relative overflow-hidden bg-muted/30">
      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-bold tracking-tight mb-8"
        >
          What if they built their own robot?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
        >
          Most kids consume technology. We teach them to create it. In 4 weeks, your child will go from playing games to programming the AI that powers them. 
        </motion.p>
      </div>
      
      {/* Abstract visual element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />
    </section>
  );
}
