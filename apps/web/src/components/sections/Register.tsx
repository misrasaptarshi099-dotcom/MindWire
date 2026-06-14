import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enquirySchema, WORKSHOP_PRICE } from '@mindwire/shared';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function Register() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(enquirySchema),
    defaultValues: { hp: '' }
  });

  const onSubmit = async (data: z.infer<typeof enquirySchema>) => {
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('API URL is not configured. Please set VITE_API_URL.');
      }

      const response = await fetch(apiUrl + '/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        let message = 'Failed to submit enquiry';
        try { const result = await response.json(); message = result.message || message; } catch { /* JSON parse failed */ }
        throw new Error(message);
      }
      
      setStatus('success');
      // In a full integration, here we would redirect to a payment checkout session
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <section className="py-24" id="register">
        <div className="max-w-xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-12 border border-primary/30"
          >
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🚀</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-glow">Registration Initiated!</h2>
            <p className="text-muted-foreground mb-8">
              We've received your details. In the real application, you would now be redirected to the secure payment gateway to complete the enrollment.
            </p>
            <button 
              onClick={() => setStatus('idle')}
              className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Submit Another
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24" id="register">
      <div className="max-w-md mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Join the Mission</h2>
          <p className="text-lg text-muted-foreground">Secure your child's spot today.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 glass p-8 rounded-2xl border border-border relative">
          {/* Honeypot field - hidden from users to catch bots */}
          <input type="text" {...register("hp")} className="hidden" tabIndex={-1} autoComplete="off" />
          
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Parent's Name *</label>
            <input 
              {...register("name")}
              className={`w-full bg-background border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${errors.name ? 'border-red-500' : 'border-border'}`}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Email Address *</label>
            <input 
              {...register("email")}
              type="email"
              className={`w-full bg-background border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${errors.email ? 'border-red-500' : 'border-border'}`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Phone Number *</label>
            <input 
              {...register("phone")}
              className={`w-full bg-background border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${errors.phone ? 'border-red-500' : 'border-border'}`}
              placeholder="9876543210"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Child's Name</label>
              <input 
                {...register("childName")}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Child's Age</label>
              <input 
                {...register("childAge")}
                type="text"
                inputMode="numeric"
                className={`w-full bg-background border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${errors.childAge ? 'border-red-500' : 'border-border'}`}
                placeholder="8-14"
              />
              {errors.childAge && <p className="text-red-500 text-xs mt-1">{errors.childAge.message}</p>}
            </div>
          </div>

          {status === 'error' && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-lg hover:bg-primary/90 transition-all flex justify-center items-center gap-2 mt-4"
          >
            {status === 'loading' ? <Loader2 className="animate-spin w-5 h-5" /> : `Proceed to Payment — ₹${WORKSHOP_PRICE.toLocaleString()}`}
          </button>
        </form>
      </div>
    </section>
  );
}
