import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Spark } from '../components/sections/Spark';
import { Journey } from '../components/sections/Journey';
import { Outcomes } from '../components/sections/Outcomes';
import { Details } from '../components/sections/Details';
import { FAQ } from '../components/sections/FAQ';
import { Register } from '../components/sections/Register';

interface Workshop {
  workshopId: string;
  title: string;
  subtitle: string;
  ageGroup: { min: number; max: number };
  durationWeeks: number;
  mode: string;
  feeINR: number;
  startDate: string | Date;
  endDate: string | Date;
  seatsTotal: number;
  seatsAvailable: number;
  batches: Array<{ batchId: string; name: string }>;
}

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
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-glow leading-tight">
          {workshop?.title || 'MindWire'}
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          {workshop?.subtitle || "A child's first encounter with AI should feel like discovering a superpower. Welcome to the ultimate robotics workshop."}
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
      <FAQ />
      <Register workshop={workshop} />
    </main>
  );
}
