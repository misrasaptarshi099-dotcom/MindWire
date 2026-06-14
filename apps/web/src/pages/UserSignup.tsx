import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@mindwire/shared';
import { motion } from 'framer-motion';
import { Loader2, UserPlus } from 'lucide-react';

export function UserSignup() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';

      const response = await fetch(apiUrl + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        let message = 'Registration failed';
        try { const result = await response.json(); message = result.message || message; } catch { /* JSON parse failed */ }
        throw new Error(message);
      }

      const result = await response.json();
      const token = result.data?.token;
      if (!token) {
        throw new Error('Registration succeeded but no token was received.');
      }
      
      // Store token
      localStorage.setItem('user_token', token);
      setStatus('success');
      
      // Auto-redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 pt-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-8 rounded-2xl border border-border relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
        
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <UserPlus className="w-6 h-6" />
          </div>
        </div>
        
        {status === 'success' ? (
          <div className="text-center py-8">
            <span className="text-4xl">🎉</span>
            <h2 className="text-2xl font-bold mt-4 mb-2">Registration Complete!</h2>
            <p className="text-sm text-muted-foreground">Redirecting you to your workspace...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-2">Create an Account</h2>
            <p className="text-sm text-center text-muted-foreground mb-8">Sign up to enroll in workshops, complete payments, and manage certificates.</p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Full Name</label>
                <input 
                  {...register("name")}
                  placeholder="John Doe"
                  className={`w-full bg-background/50 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${errors.name ? 'border-red-500' : 'border-border'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Email</label>
                <input 
                  {...register("email")}
                  type="email"
                  placeholder="parent@example.com"
                  className={`w-full bg-background/50 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${errors.email ? 'border-red-500' : 'border-border'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Password (min 6 characters)</label>
                <input 
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-background/50 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${errors.password ? 'border-red-500' : 'border-border'}`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {status === 'error' && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {errorMessage}
                </div>
              )}

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-all flex justify-center items-center gap-2 mt-6"
              >
                {status === 'loading' ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Log In
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
