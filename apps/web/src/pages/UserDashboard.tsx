import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Award, Calendar, AlertCircle, X, Printer, User, Mail } from 'lucide-react';

interface Registration {
  enquiryId: string;
  referenceCode: string;
  name: string;
  email: string;
  phone: string;
  childName?: string;
  childAge?: number;
  message?: string;
  status: 'pending' | 'payment_initiated' | 'enrolled' | 'waitlisted' | 'cancelled';
  payment: {
    orderId?: string;
    paymentId?: string;
    status?: 'pending' | 'captured' | 'failed' | 'refunded';
    amount?: number;
    currency: string;
    capturedAt?: string;
  };
  workshopId: string;
  batchId: string;
  createdAt: string;
  enrolledAt?: string;
  workshopTitle: string;
  workshopFee: number;
  workshopMode: string;
  workshopStartDate?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function UserDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Certificate modal state
  const [activeCertificate, setActiveCertificate] = useState<Registration | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        
        // 1. Fetch Profile
        const profileRes = await fetch(`${apiUrl}/auth/me`, {
          credentials: 'include'
        });
        
        if (!profileRes.ok) {
          throw new Error('Failed to retrieve user profile.');
        }
        
        const profileData = await profileRes.json();
        setProfile(profileData.data?.user || null);

        // 2. Fetch Enrollments
        const enrollmentsRes = await fetch(`${apiUrl}/enquiry/user/me`, {
          credentials: 'include'
        });

        if (enrollmentsRes.ok) {
          const enrollmentsData = await enrollmentsRes.json();
          setRegistrations(enrollmentsData.data || []);
        } else {
          const errData = await enrollmentsRes.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to retrieve registrations.');
        }
      } catch (err: unknown) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'Session expired or authentication failed. Please log in again.';
        setError(message);
        document.cookie = 'user_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'payment_initiated': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'pending': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'waitlisted': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enrolled': return 'Enrolled (Paid)';
      case 'payment_initiated': return 'Payment Initiated';
      case 'pending': return 'Pending Registration';
      case 'waitlisted': return 'Waitlisted';
      default: return 'Cancelled';
    }
  };

  const printCertificate = () => {
    const printContent = document.getElementById('printable-certificate');
    if (!printContent) return;
    
    // Quick simple browser printing technique
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Certificate - MindWire</title>
            <style>
              body {
                background-color: #0b0f19;
                color: #f8fafc;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: monospace;
              }
              .cert-container {
                border: 8px double #10b981;
                padding: 40px;
                max-width: 800px;
                text-align: center;
                position: relative;
                background-color: #111827;
              }
              h1 { color: #10b981; font-size: 2.5rem; margin-bottom: 20px; }
              h2 { font-size: 1.5rem; color: #f59e0b; margin-top: 30px; }
              p { line-height: 1.6; color: #9ca3af; font-size: 1.1rem; }
              .uid { margin-top: 40px; font-size: 0.8rem; color: #4b5563; }
              @media print {
                body { background-color: #ffffff; color: #000000; }
                .cert-container { border-color: #000000; background-color: #ffffff; color: #000000; }
                h1 { color: #000000; }
                h2 { color: #000000; }
                p { color: #000000; }
                .uid { color: #000000; }
              }
            </style>
          </head>
          <body>
            <div class="cert-container">
              ${printContent.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="glass p-8 rounded-2xl max-w-md w-full border border-red-500/20 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-6 relative">
      {/* Background blobs */}
      <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        {/* Profile Card */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-2xl border border-border mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {profile.email}</span>
                </div>
              </div>
            </div>

            <div className="bg-background/40 border border-border px-4 py-2 rounded-lg text-xs font-mono">
              <span className="text-muted-foreground">Account Role:</span> <span className="text-primary font-bold uppercase">{profile.role}</span>
            </div>
          </motion.div>
        )}

        {/* Enrollments Title */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Your Registrations</h2>
          <span className="text-xs font-mono text-muted-foreground">{registrations.length} active entries</span>
        </div>

        {/* Enrollments List */}
        {registrations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 border border-dashed border-border rounded-2xl glass"
          >
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-semibold mb-1">No registrations found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              You haven't signed up for any workshops yet. Discover our workshops to get started.
            </p>
            <button
              onClick={() => navigate('/workshops')}
              className="px-6 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/95 transition-all shadow-md"
            >
              Browse Workshops
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {registrations.map((reg, index) => (
              <motion.div
                key={reg.enquiryId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass border border-border p-6 rounded-2xl flex flex-col lg:flex-row justify-between gap-6 hover:border-primary/20 transition-colors"
              >
                <div className="space-y-4 flex-grow">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold leading-tight">{reg.workshopTitle}</h3>
                    <span className={`px-2.5 py-1 text-xs font-semibold font-mono border rounded-full ${getStatusColor(reg.status)}`}>
                      {getStatusText(reg.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs font-mono">Reference Code</div>
                      <div className="font-semibold">{reg.referenceCode}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs font-mono">Student Name</div>
                      <div className="font-semibold">{reg.childName || reg.name} (Age: {reg.childAge || 'N/A'})</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs font-mono">Batch ID</div>
                      <div className="font-semibold font-mono">{reg.batchId}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs font-mono">Registration Date</div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary" />
                        {new Date(reg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>

                    {reg.payment && reg.payment.orderId && (
                      <div className="space-y-1">
                        <div className="text-muted-foreground text-xs font-mono">Transaction ID</div>
                        <div className="font-semibold font-mono truncate max-w-[200px]" title={reg.payment.orderId}>
                          {reg.payment.orderId}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col items-center justify-end gap-3 min-w-[150px]">
                  {reg.status === 'enrolled' ? (
                    <button
                      onClick={() => setActiveCertificate(reg)}
                      className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500 hover:text-emerald-950 border border-emerald-500/30 text-emerald-400 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-4 h-4" />
                      Certificate
                    </button>
                  ) : reg.status === 'pending' || reg.status === 'payment_initiated' ? (
                    <button
                      onClick={async () => {
                        try {
                          const apiUrl = import.meta.env.VITE_API_URL || '/api';
                          const res = await fetch(`${apiUrl}/payment/create-checkout-session`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ enquiryId: reg.enquiryId })
                          });
                          if (res.ok) {
                            const data = await res.json();
                            if (data.checkoutUrl) window.location.href = data.checkoutUrl;
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/95 transition-all text-center"
                    >
                      Pay ₹{reg.workshopFee.toLocaleString()}
                    </button>
                  ) : (
                    <div className="text-xs text-muted-foreground text-center py-2 font-mono">No action available</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Modal Overlay */}
      <AnimatePresence>
        {activeCertificate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCertificate(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass max-w-3xl w-full rounded-2xl border border-border shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/40">
                <span className="text-sm font-mono text-muted-foreground flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" /> Certificate Viewer
                </span>
                <button
                  onClick={() => setActiveCertificate(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Certificate Inner Container (Matches Printing Layout) */}
              <div className="p-8 flex-grow flex justify-center bg-background/20 overflow-y-auto">
                <div 
                  id="printable-certificate"
                  className="w-full max-w-2xl border-4 border-double border-emerald-500/40 p-8 md:p-12 text-center rounded-lg bg-background/60 shadow-inner relative flex flex-col items-center justify-center"
                >
                  {/* Decorative corners */}
                  <div className="absolute top-2 left-2 text-xs font-mono text-emerald-500/20">MW</div>
                  <div className="absolute top-2 right-2 text-xs font-mono text-emerald-500/20">2026</div>
                  <div className="absolute bottom-2 left-2 text-xs font-mono text-emerald-500/20">SECURE</div>
                  <div className="absolute bottom-2 right-2 text-xs font-mono text-emerald-500/20">VERIFIED</div>

                  <Award className="w-16 h-16 text-emerald-400 mb-6 text-glow" />
                  
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-widest text-glow text-emerald-400 font-mono uppercase mb-2">
                    Certificate of Completion
                  </h1>
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-8">
                    MINDWIRE // ROBOTICS & ARTIFICIAL INTELLIGENCE LABS
                  </p>

                  <p className="text-sm md:text-base text-muted-foreground font-light mb-2">
                    This is proudly presented to
                  </p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-amber-400 tracking-tight font-serif mb-6">
                    {activeCertificate.childName || activeCertificate.name}
                  </h2>

                  <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed mb-8">
                    for successfully demonstrating core proficiency, completing all hands-on build projects, and deploying AI models in the
                    <strong className="block text-foreground mt-2 text-glow">{activeCertificate.workshopTitle}</strong>
                  </p>

                  <div className="w-full border-t border-border/40 my-6" />

                  <div className="w-full grid grid-cols-2 gap-6 text-xs font-mono mt-4">
                    <div className="text-left space-y-1">
                      <div className="text-muted-foreground">DATE OF COMPLETION</div>
                      <div className="font-semibold text-foreground">
                        {activeCertificate.enrolledAt 
                          ? new Date(activeCertificate.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                          : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-muted-foreground">AUTHORIZED BY</div>
                      <div className="font-bold text-primary italic">S. Misra</div>
                      <div className="text-[10px] text-muted-foreground">Director of MindWire</div>
                    </div>
                  </div>

                  <div className="mt-8 text-[9px] font-mono text-muted-foreground/40 tracking-wider">
                    VERIFICATION HASH // UID: {activeCertificate.referenceCode}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-background/40">
                <button
                  onClick={() => setActiveCertificate(null)}
                  className="px-4 py-2 border border-border text-sm font-semibold rounded-lg hover:bg-muted transition-all"
                >
                  Close
                </button>
                <button
                  onClick={printCertificate}
                  className="px-5 py-2 bg-emerald-500 text-emerald-950 text-sm font-bold rounded-lg hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
