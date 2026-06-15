import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Spark } from '../components/sections/Spark';
import { Journey } from '../components/sections/Journey';
import { Outcomes } from '../components/sections/Outcomes';
import { Details } from '../components/sections/Details';
import { Reviews } from '../components/sections/Reviews';
import { FAQ } from '../components/sections/FAQ';
import { Register } from '../components/sections/Register';
import type { Workshop } from '../types/workshop';

interface HeroProps {
  workshop?: {
    title: string;
    subtitle: string;
  };
}

function Hero({ workshop }: HeroProps) {
  const scrollToRegister = () => {
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center relative overflow-hidden py-16 px-6">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 mt-12">
        {/* Left Text Column */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-7 space-y-6 text-left"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono tracking-wider font-semibold">
            &gt; MISSION_BRIEFING_INITIALIZED
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-glow leading-tight">
            {workshop?.title || 'MindWire'}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-xl">
            {workshop?.subtitle || "A child's first encounter with AI should feel like discovering a superpower. Welcome to the ultimate robotics workshop."}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button onClick={scrollToRegister} className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all text-lg shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              Begin Mission
            </button>
          </div>
        </motion.div>

        {/* Right Image Column */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          {/* Subtle neon glow borders surrounding the image */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25" />
          
          <div className="relative glass p-2 rounded-2xl border border-border/60 overflow-hidden shadow-2xl">
            <img 
              src="/hero_robotics.png" 
              alt="Kid building glowing robot" 
              className="w-full h-auto object-cover rounded-xl aspect-[4/3] border border-border/20 hover:scale-[1.01] transition-transform duration-500"
            />
          </div>
          
          {/* Floating glass status card */}
          <div className="absolute -bottom-4 -left-4 glass border border-border/80 p-3.5 rounded-xl flex items-center gap-3 shadow-xl backdrop-blur-md hidden md:flex">
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono text-xs font-bold">AI</div>
            <div>
              <div className="text-[10px] text-muted-foreground font-mono">SYSTEM</div>
              <div className="text-xs font-bold font-mono text-emerald-400">MISSION ACTIVE</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Landing() {
  const { workshopId } = useParams();
  const [workshop, setWorkshop] = useState<Workshop | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(apiUrl + '/workshop');
        if (res.ok) {
          const result = await res.json();
          const list = (result.data || []) as Workshop[];
          const targetId = workshopId || 'AI_ROBOTICS_SUMMER_2026';
          const match = list.find((w: Workshop) => w.workshopId === targetId);
          if (match) {
            setWorkshop(match);
          }
        }
      } catch (err) {
        console.error('Error fetching workshop details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshop();
  }, [workshopId]);

  if (loading && workshopId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <main className="bg-background text-foreground selection:bg-primary selection:text-black">
      <Hero workshop={workshop} />
      <Spark />
      <Journey />
      <Outcomes />
      <Details workshop={workshop} />
      <Reviews />
      <FAQ />
      <Register workshop={workshop} />
    </main>
  );
}
