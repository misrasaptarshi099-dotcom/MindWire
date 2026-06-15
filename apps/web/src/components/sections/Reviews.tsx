import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';

interface Review {
  name?: string;
  childName?: string;
  childAge?: number;
  rating: number;
  comment: string;
  submittedAt?: string;
  workshopTitle: string;
}

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${apiUrl}/enquiry/reviews`);
        if (res.ok) {
          const result = await res.json();
          setReviews(result.data || []);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return null; // Let main page loader handle initial load, or fail silently
  }

  return (
    <section className="py-24 relative overflow-hidden bg-muted/10">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-80 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-4 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono tracking-wider font-semibold"
          >
            &gt; PILOT_FEEDBACK_TRANSMISSION
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-glow">
            What Parents Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
            Real feedback from parents and students who have graduated from our robotics programs.
          </p>
        </div>

        {reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass max-w-xl mx-auto p-10 rounded-2xl border border-border/60 text-center flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Hologram aesthetic border top */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            <MessageSquare className="w-12 h-12 text-primary/30 mb-4 animate-pulse" />
            <h3 className="text-lg font-bold mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-light">
              Our current batch of young creators is building and coding their robots. Reviews and project ratings will appear here upon graduation!
            </p>
            
            {/* Empty Star Display */}
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 text-muted-foreground/20" />
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-foreground/90 text-sm leading-relaxed italic mb-6 font-light">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Reviewer Meta */}
                <div className="border-t border-border/30 pt-4 flex flex-col">
                  <span className="font-bold text-sm text-glow">{rev.name || 'Verified Parent'}</span>
                  {rev.childName && (
                    <span className="text-xs text-muted-foreground font-mono mt-0.5">
                      Parent of {rev.childName} (Age {rev.childAge || 'N/A'})
                    </span>
                  )}
                  <span className="text-[10px] text-primary/70 font-mono mt-2 uppercase tracking-wider">
                    {rev.workshopTitle}
                  </span>
                  {rev.submittedAt && formatDate(rev.submittedAt) && (
                    <span className="text-[10px] text-muted-foreground/60 font-mono mt-1">
                      {formatDate(rev.submittedAt)}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
