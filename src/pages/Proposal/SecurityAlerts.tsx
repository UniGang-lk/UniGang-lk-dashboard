import { useEffect, useState } from 'react';
import { LuShieldAlert, LuCircleCheck, LuBan, LuSearch } from 'react-icons/lu';

export default function SecurityAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = () => {
    fetch('http://localhost:5000/api/proposals/privacy/alerts')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAlerts(data.alerts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpdateStatus = (id: string, status: string) => {
    fetch(`http://localhost:5000/api/proposals/privacy/alerts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchAlerts();
        } else {
          alert('Failed to update alert');
        }
      })
      .catch(console.error);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <LuShieldAlert className="text-rose-500" size={32} /> Security & Privacy Alerts
          </h1>
          <p className="text-slate-500 mt-2">Monitor screenshot attempts and privacy violations.</p>
        </div>
        
        <div className="relative w-64">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center">
            <LuCircleCheck className="mx-auto text-emerald-500 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900">All Clear</h3>
            <p className="text-slate-500">No security alerts logged yet.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4">User</th>
                <th className="p-4">Violation Type</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        {alert.user?.profile_pic ? (
                          <img src={alert.user.profile_pic} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                            {alert.user?.name?.[0] || '?'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{alert.user?.name || 'Unknown User'}</div>
                        <div className="text-xs text-slate-500 font-mono">{alert.user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-700">
                      <LuShieldAlert size={12} /> {alert.action_type}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {new Date(alert.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      alert.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      alert.status === 'Banned' ? 'bg-red-100 text-red-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(alert.id, 'Reviewed')}
                        className="p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 rounded-lg transition-colors" 
                        title="Mark as Reviewed"
                      >
                        <LuCircleCheck size={18} />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(alert.id, 'Banned')}
                        className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors" 
                        title="Ban User"
                      >
                        <LuBan size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
