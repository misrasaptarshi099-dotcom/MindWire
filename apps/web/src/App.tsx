import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

function Hero() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass p-12 rounded-2xl max-w-3xl w-full text-center z-10 border border-border"
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
          <button className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all text-lg shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            Begin Mission
          </button>
          <button className="px-8 py-4 bg-transparent border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-all text-lg">
            View Intel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hero />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
