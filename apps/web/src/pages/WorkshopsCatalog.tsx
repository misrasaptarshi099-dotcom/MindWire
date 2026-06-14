import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Calendar, Clock, MonitorPlay, Users, CreditCard } from 'lucide-react';
import type { Workshop } from '../types/workshop';

export function WorkshopsCatalog() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(apiUrl + '/workshop');
        if (res.ok) {
          const result = await res.json();
          setWorkshops(result.data || []);
        } else {
          throw new Error('Failed to retrieve workshops data.');
        }
      } catch (err) {
        console.error('Error fetching workshops:', err);
        setError('Could not load catalog. Please check your network or try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshops();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 mb-4 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono tracking-wider font-semibold"
          >
            &gt; MINDWIRE_CATALOG_ONLINE
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-glow"
          >
            Active Missions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Choose a robotics or coding track to kickstart your child's journey with advanced technologies.
          </motion.p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
          </div>
        ) : error ? (
          <div className="text-center py-24 border border-red-500/20 bg-red-500/5 rounded-2xl glass">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError('');
                const apiUrl = import.meta.env.VITE_API_URL || '/api';
                fetch(apiUrl + '/workshop')
                  .then(async res => {
                    if (res.ok) {
                      const result = await res.json();
                      setWorkshops(result.data || []);
                    } else {
                      throw new Error('Failed to retrieve workshops.');
                    }
                  })
                  .catch(err => {
                    console.error(err);
                    setError('Could not load catalog. Please check your network or try again.');
                  })
                  .finally(() => setLoading(false));
              }}
              className="px-6 py-2.5 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary hover:text-primary-foreground font-semibold transition-all shadow-[0_0_15px_rgba(0,240,255,0.1)]"
            >
              Retry Connection
            </button>
          </div>
        ) : workshops.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-2xl glass">
            <p className="text-muted-foreground text-lg">No active workshops available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((w, index) => (
              <motion.div
                key={w.workshopId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl border border-border overflow-hidden hover:border-primary/40 transition-all flex flex-col group relative"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-secondary/50 group-hover:from-primary group-hover:to-secondary transition-all" />
                
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
                    {w.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-3 flex-grow">
                    {w.subtitle}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-muted-foreground font-mono">Age Group:</span>
                      <span className="font-semibold">{w.ageGroup.min}-{w.ageGroup.max} Years</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-muted-foreground font-mono">Duration:</span>
                      <span className="font-semibold">{w.durationWeeks} Weeks</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <MonitorPlay className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-muted-foreground font-mono">Mode:</span>
                      <span className="font-semibold capitalize">{w.mode}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-muted-foreground font-mono">Starts:</span>
                      <span className="font-semibold">
                        {new Date(w.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <CreditCard className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-muted-foreground font-mono">Fee:</span>
                      <span className="font-semibold text-glow text-primary">₹{w.feeINR.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Seat availability badge */}
                  <div className="mb-6 flex justify-between items-center bg-background/50 border border-border p-3 rounded-lg text-xs font-mono">
                    <span className="text-muted-foreground">Seats:</span>
                    <span className={w.seatsAvailable > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      {w.seatsAvailable > 0 ? `${w.seatsAvailable} remaining` : 'Waitlisted'}
                    </span>
                  </div>

                  <Link
                    to={`/workshops/${w.workshopId}`}
                    className="block w-full py-3 bg-primary/10 border border-primary/30 text-primary text-center font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm"
                  >
                    Explore & Register
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
