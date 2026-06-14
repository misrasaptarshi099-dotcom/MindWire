import { motion } from 'framer-motion';
import { Spark } from '../components/sections/Spark';
import { Journey } from '../components/sections/Journey';
import { Outcomes } from '../components/sections/Outcomes';
import { Details } from '../components/sections/Details';
import { FAQ } from '../components/sections/FAQ';
import { Register } from '../components/sections/Register';

function Hero() {
  const scrollToRegister = () => {
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass p-12 rounded-2xl max-w-3xl w-full text-center z-10 border border-border mt-12"
      >
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-mono tracking-wider font-semibold">
          &gt; MISSION_BRIEFING_INITIALIZED
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-glow">
          MindWire
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          A child's first encounter with AI should feel like discovering a superpower. Welcome to the ultimate robotics workshop.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={scrollToRegister} className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all text-lg shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            Begin Mission
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function Landing() {
  return (
    <main className="bg-background text-foreground selection:bg-primary selection:text-black">
      <Hero />
      <Spark />
      <Journey />
      <Outcomes />
      <Details />
      <FAQ />
      <Register />
    </main>
  );
}
