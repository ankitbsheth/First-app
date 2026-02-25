import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Utensils, 
  ChevronRight, 
  LayoutDashboard, 
  UserPlus,
  Loader2,
  PieChart,
  ClipboardList,
  Trash2
} from 'lucide-react';

type RSVP = {
  id: number;
  name: string;
  attending: number;
  dish: string | null;
  created_at: string;
};

export default function App() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [formError, setFormError] = useState('');
  const [isWiping, setIsWiping] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    attending: true,
    dish: ''
  });

  useEffect(() => {
    fetchRSVPs();
  }, []);

  const fetchRSVPs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rsvps');
      const data = await res.json();
      setRsvps(data);
    } catch (err) {
      console.error('Failed to fetch RSVPs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // We'll just check if the password is correct by trying a wipe or just a simple check
    // For now, let's just use a simple local check to show the wipe button
    // The server will still validate it.
    setIsAdminAuthenticated(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();

      if (res.ok) {
        setIsUpdate(data.updated || false);
        setSubmitted(true);
        setFormData({ name: '', attending: true, dish: '' });
        fetchRSVPs(); // Refresh list
      } else {
        setFormError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Submission failed', err);
      setFormError('Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWipeData = async () => {
    setIsWiping(true);
    try {
      const res = await fetch('/api/rsvps', {
        method: 'DELETE',
        headers: {
          'x-admin-password': adminPassword
        }
      });
      if (res.ok) {
        setRsvps([]);
        setShowWipeConfirm(false);
        setShowAdminModal(false);
        setIsAdminAuthenticated(false);
        setAdminPassword('');
      } else {
        setAuthError('Invalid password');
      }
    } catch (err) {
      console.error('Wipe failed', err);
    } finally {
      setIsWiping(false);
    }
  };

  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.attending === 1).length,
    notAttending: rsvps.filter(r => r.attending === 0).length,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Users className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight">Potluck RSVP</span>
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setSubmitted(false);
                setIsUpdate(false);
              }}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 bg-white text-indigo-600 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              RSVP
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="max-w-md mx-auto mb-12">
          <div className="bg-white rounded-3xl shadow-xl shadow-indigo-500/5 border border-slate-100 overflow-hidden">
            <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/10">
                  Save the date • 3rd March 2026 • 12pm - 2pm
                </div>
                <h1 className="text-3xl font-bold mb-2 tracking-tight">Team Potluck - SDM</h1>
                <p className="text-indigo-100 opacity-90 text-sm leading-relaxed">
                  Join us for a celebration of good food and great company! 
                  Please let us know if you'll be joining the feast.
                </p>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <Utensils size={160} />
              </div>
            </div>

            <div className="p-8">
              {submitted ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    {isUpdate ? 'RSVP Updated!' : 'RSVP Confirmed!'}
                  </h2>
                  <p className="text-slate-500 mb-8">
                    {isUpdate 
                      ? 'Your changes have been saved successfully.' 
                      : "Thanks for letting us know. We can't wait to see you!"}
                  </p>
                  <button 
                    onClick={() => {
                      setSubmitted(false);
                      setIsUpdate(false);
                    }}
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    Update your response
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => {
                        setFormData({ ...formData, name: e.target.value });
                        setFormError('');
                      }}
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-3 rounded-xl border ${formError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all`}
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      Already RSVP'd? Use the same name to update your response.
                    </p>
                    {formError && <p className="text-rose-500 text-sm mt-2 font-medium">{formError}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Will you be attending?</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, attending: true })}
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          formData.attending 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">Yes, I'm in!</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, attending: false })}
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          !formData.attending 
                            ? 'border-rose-600 bg-rose-50 text-rose-600' 
                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        <XCircle className="w-5 h-5" />
                        <span className="font-medium">Can't make it</span>
                      </button>
                    </div>
                  </div>

                  {formData.attending && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="space-y-6 overflow-hidden"
                    >
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">What are you bringing? (Optional)</label>
                        <input
                          type="text"
                          value={formData.dish}
                          onChange={e => setFormData({ ...formData, dish: e.target.value })}
                          placeholder="e.g. Potato Salad, Brownies..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </motion.div>
                  )}

                  <button
                    disabled={submitting}
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Submit RSVP
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Public Results Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Who's Coming?</h2>
              <p className="text-slate-500">Real-time potluck guest list</p>
            </div>
            <button 
              onClick={fetchRSVPs}
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              label="Total Responses" 
              value={stats.total} 
              icon={<ClipboardList className="w-5 h-5" />}
              color="indigo"
            />
            <StatCard 
              label="Attending" 
              value={stats.attending} 
              icon={<CheckCircle2 className="w-5 h-5" />}
              color="emerald"
            />
            <StatCard 
              label="Not Attending" 
              value={stats.notAttending} 
              icon={<XCircle className="w-5 h-5" />}
              color="rose"
            />
          </div>

          {/* Responses Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bringing</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rsvps.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        No responses yet. Be the first!
                      </td>
                    </tr>
                  ) : (
                    rsvps.map((rsvp) => (
                      <tr key={rsvp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{rsvp.name}</td>
                        <td className="px-6 py-4">
                          {rsvp.attending === 1 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Attending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                              <XCircle className="w-3 h-3" />
                              Not Attending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {rsvp.dish || <span className="text-slate-300 italic">Nothing listed</span>}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(rsvp.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Footer Admin Access */}
        <div className="mt-20 pt-8 border-t border-slate-200 text-center space-y-4">
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => setShowAdminModal(true)}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
            >
              <LayoutDashboard className="w-3 h-3" />
              Admin Access
            </button>
            <button 
              onClick={() => setShowAdminModal(true)}
              className="text-xs font-medium text-rose-400 hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Wipe All Data
            </button>
          </div>
        </div>

        {/* Admin Login Modal */}
        <AnimatePresence>
          {showAdminModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
              >
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <LayoutDashboard className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Admin Panel</h2>
                
                {!isAdminAuthenticated ? (
                  <form onSubmit={handleAdminAuth} className="space-y-4">
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAdminModal(false)}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold"
                      >
                        Unlock
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowWipeConfirm(true)}
                      className="w-full px-4 py-3 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-all"
                    >
                      Wipe All Data
                    </button>
                    <button
                      onClick={() => {
                        setShowAdminModal(false);
                        setIsAdminAuthenticated(false);
                        setAdminPassword('');
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600"
                    >
                      Close
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Wipe Confirmation Modal */}
        <AnimatePresence>
          {showWipeConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
              >
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                  <XCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Wipe all data?</h3>
                <p className="text-slate-500 mb-8">This action cannot be undone. All RSVP entries will be permanently deleted.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowWipeConfirm(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWipeData}
                    disabled={isWiping}
                    className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isWiping ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Wipe'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500 font-medium">{label}</div>
    </div>
  );
}
