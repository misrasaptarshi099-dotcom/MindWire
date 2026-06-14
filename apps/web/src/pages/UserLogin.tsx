import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@mindwire/shared';
import { motion } from 'framer-motion';
import { Loader2, KeyRound } from 'lucide-react';

export function UserLogin() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';

      const response = await fetch(apiUrl + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        let message = 'Login failed';
        try { const result = await response.json(); message = result.message || message; } catch { /* JSON parse failed */ }
        throw new Error(message);
      }

      navigate('/dashboard');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Invalid credentials');
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
            <KeyRound className="w-6 h-6" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-sm text-center text-muted-foreground mb-8">Access your MindWire account and learning dashboard.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Password</label>
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
            {status === 'loading' ? <Loader2 className="animate-spin w-5 h-5" /> : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
