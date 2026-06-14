import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: "Does my child need prior coding experience?",
    a: "No, zero experience is required. We start from the absolute basics and gradually introduce complex concepts in a fun, accessible way."
  },
  {
    q: "What tools/software will be used?",
    a: "Everything is browser-based! We use tools like Teachable Machine, Scratch, and online Python environments. No heavy installations needed."
  },
  {
    q: "Are sessions recorded?",
    a: "Yes, all live sessions are recorded and made available within 24 hours. Students have replay access for 30 days after the workshop ends."
  },
  {
    q: "What if we miss a class?",
    a: "Along with the recorded session, we offer dedicated makeup slots over the weekend to help students catch up and ask questions."
  },
  {
    q: "Is there a refund policy?",
    a: "Yes, we offer a full 100% refund no-questions-asked within 48 hours of booking your slot, so you can register completely risk-free."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-muted/20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Transmission Logs</h2>
          <p className="text-lg text-muted-foreground">Frequently asked questions.</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="glass rounded-xl overflow-hidden border border-border">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              >
                <span className="font-semibold text-lg">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-4 pt-2 text-muted-foreground leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
