import { motion } from 'framer-motion';
import { Calendar, Clock, MonitorPlay, Users, Wallet } from 'lucide-react';

const details = [
  { label: "Age Group", value: "8–14 Years", icon: <Users /> },
  { label: "Duration", value: "4 Weeks (20 sessions × 90 min)", icon: <Clock /> },
  { label: "Mode", value: "Online (Live + Recorded)", icon: <MonitorPlay /> },
  { label: "Start Date", value: "15 July 2026", icon: <Calendar /> },
  { label: "Fee", value: "₹2,999 (all-inclusive)", icon: <Wallet /> },
];

export function Details() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Mission Parameters</h2>
          <p className="text-lg text-muted-foreground">Everything you need to know.</p>
        </div>
        
        <div className="glass rounded-2xl p-8 md:p-12 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {details.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-primary shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground font-mono">{item.label}</div>
                  <div className="font-semibold text-lg">{item.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-border flex justify-center">
            <button className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              Secure a Slot
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
