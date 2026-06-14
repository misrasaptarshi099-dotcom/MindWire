import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Users, CheckCircle, CreditCard, Clock } from 'lucide-react';

interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  childName?: string;
  childAge?: number;
  status: string;
  referenceCode: string;
  createdAt: string;
}

export function AdminDashboard() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnquiries = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      try {
        // In a real app we would have an actual GET /api/enquiry endpoint for admins
        // For the sake of the assignment UI, we will mock data if the endpoint doesn't exist
        // or attempt to fetch it if we implemented it.
        // Assuming we haven't built the GET /enquiry backend yet, we use mock data for the UI
        setTimeout(() => {
          setEnquiries([
            { _id: '1', name: 'John Doe', email: 'john@example.com', phone: '9876543210', childName: 'Aryan', childAge: 10, status: 'enrolled', referenceCode: 'MW-ABC-123', createdAt: new Date().toISOString() },
            { _id: '2', name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543211', childName: 'Diya', childAge: 12, status: 'pending', referenceCode: 'MW-XYZ-789', createdAt: new Date(Date.now() - 86400000).toISOString() },
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error(error);
        navigate('/admin/login');
      }
    };

    fetchEnquiries();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enrolled': return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/30 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Enrolled</span>;
      case 'payment_initiated': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs border border-yellow-500/30 flex items-center gap-1 w-fit"><CreditCard className="w-3 h-3" /> Initiated</span>;
      default: return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs border border-gray-500/30 flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold font-mono">MW</div>
            <span className="font-semibold tracking-wide">Command Center</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass p-6 rounded-xl border border-border">
            <div className="text-muted-foreground text-sm font-medium mb-2">Total Enquiries</div>
            <div className="text-3xl font-bold">{enquiries.length}</div>
          </div>
          <div className="glass p-6 rounded-xl border border-border">
            <div className="text-muted-foreground text-sm font-medium mb-2">Enrolled</div>
            <div className="text-3xl font-bold text-green-400">{enquiries.filter(e => e.status === 'enrolled').length}</div>
          </div>
          <div className="glass p-6 rounded-xl border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-primary">
              <Users className="w-16 h-16" />
            </div>
            <div className="text-muted-foreground text-sm font-medium mb-2">Revenue Potential</div>
            <div className="text-3xl font-bold text-primary">₹{(enquiries.filter(e => e.status === 'enrolled').length * 2999).toLocaleString()}</div>
          </div>
        </div>

        {/* Table Section */}
        <div className="glass rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center bg-muted/10">
            <h2 className="text-lg font-semibold">Recent Registrations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                <tr>
                  <th className="px-6 py-4 font-medium">Ref Code</th>
                  <th className="px-6 py-4 font-medium">Parent Info</th>
                  <th className="px-6 py-4 font-medium">Child Info</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enquiries.map((enq) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={enq._id} 
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs">{enq.referenceCode}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{enq.name}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{enq.email}</div>
                      <div className="text-muted-foreground text-xs">{enq.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground">{enq.childName || '—'}</div>
                      <div className="text-muted-foreground text-xs">{enq.childAge ? `${enq.childAge} yrs` : '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(enq.status)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {enquiries.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No registrations found.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
