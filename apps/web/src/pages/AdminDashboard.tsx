import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, CheckCircle, CreditCard, Clock, Edit2, Trash2, FileText, Settings, X, PlusCircle, Loader2 } from 'lucide-react';


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
  workshopId: string;
  batchId: string;
  feeINR?: number;
}

interface Batch {
  batchId: string;
  name: string;
  seats: number;
  enrolled: number;
}

interface Workshop {
  _id: string;
  workshopId: string;
  title: string;
  subtitle: string;
  ageGroup: { min: number; max: number };
  durationWeeks: number;
  mode: 'online' | 'offline' | 'hybrid';
  feeINR: number;
  startDate: string;
  endDate: string;
  seatsTotal: number;
  seatsAvailable: number;
  status: 'upcoming' | 'active' | 'full' | 'completed';
  batches: Batch[];
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'registrations' | 'workshops' | 'users'>('registrations');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);

  // Form states
  const [wsId, setWsId] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [minAge, setMinAge] = useState(8);
  const [maxAge, setMaxAge] = useState(14);
  const [duration, setDuration] = useState(4);
  const [mode, setMode] = useState<'online' | 'offline' | 'hybrid'>('hybrid');
  const [fee, setFee] = useState(2999);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [seats, setSeats] = useState(50);

  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || '/api';

      // 1. Fetch registrations
      const enqRes = await fetch(`${apiUrl}/enquiry`, {
        credentials: 'include'
      });
      if (!enqRes.ok) {
        const error = new Error('Failed to retrieve registration data.') as Error & { status?: number };
        error.status = enqRes.status;
        throw error;
      }
      const enqData = await enqRes.json();
      setEnquiries(enqData.data || []);

      // 2. Fetch workshops
      const wsRes = await fetch(`${apiUrl}/workshop`);
      if (!wsRes.ok) {
        const error = new Error('Failed to retrieve workshops data.') as Error & { status?: number };
        error.status = wsRes.status;
        throw error;
      }
      const wsData = await wsRes.json();
      setWorkshops(wsData.data || []);

      // 3. Fetch users
      const usersRes = await fetch(`${apiUrl}/users`, {
        credentials: 'include'
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data || []);
      }

      setError('');
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Authentication failed. Please log in again.';
      setError(message);
      
      const status = (err as { status?: number })?.status;
      if (status === 401 || status === 403) {
        sessionStorage.removeItem('admin_token');
        setTimeout(() => navigate('/admin/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enrolled': return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/30 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Enrolled</span>;
      case 'payment_initiated': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs border border-yellow-500/30 flex items-center gap-1 w-fit"><CreditCard className="w-3 h-3" /> Initiated</span>;
      default: return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs border border-gray-500/30 flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  const openAddModal = () => {
    setEditingWorkshop(null);
    setWsId('');
    setTitle('');
    setSubtitle('');
    setMinAge(8);
    setMaxAge(14);
    setDuration(4);
    setMode('hybrid');
    setFee(2999);
    setStart('');
    setEnd('');
    setSeats(50);
    setIsModalOpen(true);
  };

  const openEditModal = (w: Workshop) => {
    setEditingWorkshop(w);
    setWsId(w.workshopId);
    setTitle(w.title);
    setSubtitle(w.subtitle);
    setMinAge(w.ageGroup.min);
    setMaxAge(w.ageGroup.max);
    setDuration(w.durationWeeks);
    setMode(w.mode);
    setFee(w.feeINR);
    setStart(new Date(w.startDate).toISOString().split('T')[0]);
    setEnd(new Date(w.endDate).toISOString().split('T')[0]);
    setSeats(w.seatsTotal);
    setIsModalOpen(true);
  };

  const handleDeleteWorkshop = async (workshopId: string) => {
    if (!confirm('Are you sure you want to delete this workshop? This action cannot be undone.')) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiUrl}/workshop/${workshopId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to delete workshop.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during deletion.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiUrl}/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to delete user.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during deletion.');
    }
  };

  const handleSubmitWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingWorkshop) {
      const currentEnrollment = editingWorkshop.seatsTotal - editingWorkshop.seatsAvailable;
      if (seats < currentEnrollment) {
        alert(`Cannot update seats. The new seats total (${seats}) is less than the current enrollment count (${currentEnrollment}).`);
        return;
      }
    }


    
    const payload = {
      workshopId: wsId,
      title,
      subtitle,
      ageGroup: { min: minAge, max: maxAge },
      durationWeeks: duration,
      mode,
      feeINR: fee,
      startDate: new Date(start).toISOString(),
      endDate: new Date(end).toISOString(),
      seatsTotal: seats,
      seatsAvailable: editingWorkshop ? Math.max(0, seats - (editingWorkshop.seatsTotal - editingWorkshop.seatsAvailable)) : seats,
      status: editingWorkshop ? editingWorkshop.status : 'upcoming',
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const url = editingWorkshop 
        ? `${apiUrl}/workshop/${editingWorkshop.workshopId}`
        : `${apiUrl}/workshop`;
      
      const method = editingWorkshop ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchDashboardData();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Operation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error submitting workshop.');
    }
  };

  if (loading && enquiries.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-muted/30 fixed top-0 w-full z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold font-mono">MW</div>
            <span className="font-semibold tracking-wide">Command Center (Admin)</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 mb-6 font-mono text-sm">
            {error}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass p-6 rounded-xl border border-border">
            <div className="text-muted-foreground text-sm font-medium mb-2 font-mono">Total Registrations</div>
            <div className="text-3xl font-bold">{enquiries.length}</div>
          </div>
          <div className="glass p-6 rounded-xl border border-border">
            <div className="text-muted-foreground text-sm font-medium mb-2 font-mono">Active Enrollments</div>
            <div className="text-3xl font-bold text-green-400">{enquiries.filter(e => e.status === 'enrolled').length}</div>
          </div>
          <div className="glass p-6 rounded-xl border border-border relative overflow-hidden">
            <div className="text-muted-foreground text-sm font-medium mb-2 font-mono">Collected Revenue</div>
            <div className="text-3xl font-bold text-primary">
              ₹{enquiries.filter(e => e.status === 'enrolled').reduce((acc, curr) => {
                const fee = curr.feeINR ?? (workshops.find(w => w.workshopId === curr.workshopId)?.feeINR || 2999);
                return acc + fee;
              }, 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`pb-4 text-sm font-semibold tracking-wide flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'registrations' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4" /> Enquiries & Registrations
          </button>
          <button
            onClick={() => setActiveTab('workshops')}
            className={`pb-4 text-sm font-semibold tracking-wide flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'workshops' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="w-4 h-4" /> Workshops CMS
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 text-sm font-semibold tracking-wide flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" /> Registered Users
          </button>
        </div>

        {/* Registrations View */}
        {activeTab === 'registrations' && (
          <div className="glass rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/10">
              <h2 className="text-lg font-semibold">Registered Students</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 font-mono">
                  <tr>
                    <th className="px-6 py-4 font-medium">Ref Code</th>
                    <th className="px-6 py-4 font-medium">Parent Contact</th>
                    <th className="px-6 py-4 font-medium">Child Info</th>
                    <th className="px-6 py-4 font-medium">Workshop & Batch</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {enquiries.map((enq) => (
                    <tr key={enq._id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-semibold">{enq.referenceCode}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{enq.name}</div>
                        <div className="text-muted-foreground text-xs">{enq.email}</div>
                        <div className="text-muted-foreground text-xs">{enq.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{enq.childName || '—'}</div>
                        <div className="text-muted-foreground text-xs">{enq.childAge ? `${enq.childAge} yrs` : '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-xs truncate max-w-[200px]" title={enq.workshopId}>{enq.workshopId}</div>
                        <div className="text-muted-foreground text-[10px] font-mono mt-0.5">{enq.batchId}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(enq.status)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {enquiries.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  No registrations found in the system.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workshops CMS View */}
        {activeTab === 'workshops' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={openAddModal}
                className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/95 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              >
                <PlusCircle className="w-5 h-5" /> Add Workshop
              </button>
            </div>

            <div className="glass rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/30 font-mono">
                    <tr>
                      <th className="px-6 py-4 font-medium">ID</th>
                      <th className="px-6 py-4 font-medium">Workshop details</th>
                      <th className="px-6 py-4 font-medium">Mode</th>
                      <th className="px-6 py-4 font-medium">Fee</th>
                      <th className="px-6 py-4 font-medium">Schedule</th>
                      <th className="px-6 py-4 font-medium">Seats</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {workshops.map((w) => (
                      <tr key={w._id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-semibold">{w.workshopId}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-base">{w.title}</div>
                          <div className="text-muted-foreground text-xs line-clamp-1 mt-0.5">{w.subtitle}</div>
                        </td>
                        <td className="px-6 py-4 capitalize font-medium">{w.mode}</td>
                        <td className="px-6 py-4 font-semibold text-primary">₹{w.feeINR.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs">
                          <div>Starts: {new Date(w.startDate).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">Weeks: {w.durationWeeks}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          <div>Total: {w.seatsTotal}</div>
                          <div className="text-emerald-400 font-bold">Avail: {w.seatsAvailable}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(w)}
                              className="p-2 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteWorkshop(w.workshopId)}
                              className="p-2 border border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {workshops.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    No active workshops found. Click "Add Workshop" to create one.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Workshop Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass max-w-xl w-full rounded-2xl border border-border shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/40">
                <span className="text-sm font-semibold tracking-wide flex items-center gap-1.5 font-mono">
                  {editingWorkshop ? 'Edit Workshop Parameters' : 'Deploy New Workshop'}
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitWorkshop} className="p-6 overflow-y-auto space-y-4 flex-grow">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5">Workshop ID *</label>
                    <input
                      required
                      value={wsId}
                      onChange={(e) => setWsId(e.target.value)}
                      disabled={editingWorkshop !== null}
                      placeholder="e.g. AI_ROBOTICS_SUMMER_2026"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5">Title *</label>
                    <input
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. AI & Robotics Summer Camp"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1.5">Subtitle / Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Enter short workshop description..."
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5">Min Age Group *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={minAge}
                      onChange={(e) => setMinAge(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5">Max Age Group *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={maxAge}
                      onChange={(e) => setMaxAge(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5">Duration (Weeks) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5">Mode *</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as 'online' | 'offline' | 'hybrid')}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5">Fee (INR) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={fee}
                      onChange={(e) => setFee(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5">Total Seats *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={seats}
                      onChange={(e) => setSeats(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1.5">End Date *</label>
                    <input
                      type="date"
                      required
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-border text-sm font-semibold rounded-lg hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/95 transition-all shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="glass rounded-xl overflow-hidden border border-border">
              {users.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No users found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-primary/5 border-b border-border text-sm">
                        <th className="p-4 font-semibold">User</th>
                        <th className="p-4 font-semibold">Role</th>
                        <th className="p-4 font-semibold">Joined At</th>
                        <th className="p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map(user => (
                        <tr key={user._id} className="hover:bg-primary/5 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-glow">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full uppercase tracking-wider font-semibold border border-primary/30">
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
