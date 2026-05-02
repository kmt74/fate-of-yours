import React, { useState, useMemo } from "react";
import { Users, BarChart3, ShieldAlert, TrendingUp, Search, UserMinus, UserCheck, Activity, Calendar, PieChart as PieIcon, LogOut } from "lucide-react";
import { useApp } from "../context/AppContext";
import { DB } from "../lib/db";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useNavigate } from "react-router";

export default function AdminPage() {
  const { adminUsers, banUser } = useApp();
  const [activeTab, setActiveTab] = useState<"overview" | "users">("overview");
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "1y">("7d");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const readings = useMemo(() => DB.getReadings(), []);
  const visits = useMemo(() => DB.getVisits(), []);

  // --- Data Processing for Charts ---
  const filteredAnalytics = useMemo(() => {
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 365;
    const cutoff = now - (days * msPerDay);

    const trendData: Record<string, number> = {};
    
    // Group readings by day/month
    readings.forEach(r => {
      if (r.timestamp >= cutoff) {
        const date = new Date(r.timestamp);
        const key = timeframe === "1y" ? date.toLocaleString('default', { month: 'short' }) : date.toLocaleDateString();
        trendData[key] = (trendData[key] || 0) + 1;
      }
    });

    return Object.entries(trendData).map(([name, count]) => ({ name, count })).slice(-days);
  }, [timeframe, readings]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    readings.forEach(r => {
      stats[r.category] = (stats[r.category] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  }, [readings]);

  const COLORS = ['#C9A84C', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'];

  const filteredUsers = adminUsers.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleLogout = () => {
    sessionStorage.removeItem("isAdminAuthenticated");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#070710] text-[#F0E6D3] flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[rgba(201,168,76,0.1)] bg-[#0A0A15] flex flex-col pt-8">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C9A84C] to-[#8B5CF6] flex items-center justify-center text-[10px] shadow-[0_0_15px_rgba(201,168,76,0.3)]">✦</div>
          <h2 className="text-[0.8rem] tracking-[0.1em] text-[#C9A84C]" style={{ fontFamily: "'Cinzel', serif" }}>ADMIN ORACLE</h2>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveTab("overview")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === "overview" ? "bg-[rgba(201,168,76,0.08)] text-[#C9A84C] border border-[rgba(201,168,76,0.15)]" : "text-[rgba(240,230,211,0.4)] hover:text-[#F0E6D3] hover:bg-white/5"}`}>
            <BarChart3 size={18} />
            <span className="text-[0.85rem] font-medium tracking-wide" style={{ fontFamily: "'Raleway', sans-serif" }}>Insights</span>
          </button>
          <button onClick={() => setActiveTab("users")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === "users" ? "bg-[rgba(201,168,76,0.08)] text-[#C9A84C] border border-[rgba(201,168,76,0.15)]" : "text-[rgba(240,230,211,0.4)] hover:text-[#F0E6D3] hover:bg-white/5"}`}>
            <Users size={18} />
            <span className="text-[0.85rem] font-medium tracking-wide" style={{ fontFamily: "'Raleway', sans-serif" }}>Users</span>
          </button>
        </nav>

        <div className="p-6 border-t border-[rgba(201,168,76,0.05)]">
          <button onClick={handleLogout} className="flex items-center gap-3 text-[0.7rem] text-[rgba(240,230,211,0.3)] hover:text-red-400 transition-colors uppercase font-bold tracking-widest">
            <LogOut size={14} />
            <span>Close Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.05)_0%,transparent_60%)]">
        <div className="max-w-[1200px] mx-auto p-10">
          
          <header className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-wider mb-2" style={{ fontFamily: "'Cinzel', serif", color: "#F0E6D3" }}>
                {activeTab === "overview" ? "System Insights" : "User Management"}
              </h1>
              <div className="flex items-center gap-4 text-[0.8rem] text-[rgba(240,230,211,0.4)]" style={{ fontFamily: "'Raleway', sans-serif" }}>
                 <Activity size={14} className="text-[#8B5CF6]" />
                 <span>Celestial Currents Active</span>
              </div>
            </div>

            {activeTab === "overview" && (
              <div className="flex bg-white/[0.03] border border-white/5 rounded-2xl p-1 p-1">
                {(['7d', '30d', '1y'] as const).map(tf => (
                  <button 
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-2 rounded-xl text-[0.7rem] font-bold transition-all ${timeframe === tf ? 'bg-[#C9A84C] text-[#070710]' : 'text-[rgba(240,230,211,0.4)] hover:text-[#F0E6D3]'}`}
                    style={{ fontFamily: "'Raleway', sans-serif" }}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </header>

          {activeTab === "overview" ? (
            <div className="space-y-10 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                   { label: "Total Visits", value: visits.length.toLocaleString(), icon: Activity, color: "#8B5CF6" },
                   { label: "Total Readings", value: readings.length.toLocaleString(), icon: TrendingUp, color: "#C9A84C" },
                   { label: "Active Souls", value: adminUsers.length.toString(), icon: Users, color: "#3B82F6" },
                   { label: "Avg Depth", value: "4.2", icon: BarChart3, color: "#10B981" }
                 ].map((stat, i) => (
                   <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                      <div className="text-[0.65rem] uppercase tracking-[0.2em] text-[rgba(240,230,211,0.4)] mb-3 font-bold">{stat.label}</div>
                      <div className="text-xl font-bold flex items-center justify-between" style={{ color: "#F0E6D3" }}>
                        {stat.value}
                        <stat.icon size={18} style={{ color: stat.color }} />
                      </div>
                   </div>
                 ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Trends Chart */}
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />
                   <h3 className="text-lg mb-8" style={{ fontFamily: "'Cinzel', serif", color: "#C9A84C" }}>Energy Cycles</h3>
                   <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredAnalytics}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,230,211,0.05)" vertical={false} />
                          <XAxis dataKey="name" stroke="rgba(240,230,211,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="rgba(240,230,211,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0F0F1A', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '12px' }}
                            itemStyle={{ color: '#C9A84C', fontFamily: 'Raleway' }}
                          />
                          <Area type="monotone" dataKey="count" stroke="#C9A84C" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                {/* Category Stats */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                   <h3 className="text-lg mb-8" style={{ fontFamily: "'Cinzel', serif", color: "#8B5CF6" }}>Fated Spheres</h3>
                   <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={8}
                            dataKey="value"
                          >
                            {categoryStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0F0F1A', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px' }}
                            itemStyle={{ color: '#8B5CF6' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="grid grid-cols-2 gap-4 mt-6">
                      {categoryStats.map((stat, i) => (
                        <div key={i} className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                           <span className="text-[0.6rem] font-bold text-[rgba(240,230,211,0.4)] uppercase tracking-wider">{stat.name}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
               {/* Same user management table but with updated UI */}
               <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(240,230,211,0.3)]" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search by email or destiny..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-[0.85rem] focus:outline-none focus:border-[#C9A84C]/30 transition-all text-[#F0E6D3] placeholder:text-white/10"
                    style={{ fontFamily: "'Raleway', sans-serif" }}
                  />
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="p-6 text-[0.65rem] uppercase tracking-[0.2em] text-[rgba(240,230,211,0.4)] font-bold">User Identity</th>
                        <th className="p-6 text-[0.65rem] uppercase tracking-[0.2em] text-[rgba(240,230,211,0.4)] font-bold">Status</th>
                        <th className="p-6 text-[0.65rem] uppercase tracking-[0.2em] text-[rgba(240,230,211,0.4)] font-bold text-right">Sanctions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                          <td className="p-6 flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/5 to-white/10 border border-white/5 flex items-center justify-center text-[0.7rem] font-bold text-[#C9A84C]">{user.email[0].toUpperCase()}</div>
                             <span className="text-[0.85rem] font-medium text-[rgba(240,230,211,0.8)]">{user.email}</span>
                          </td>
                          <td className="p-6">
                            <span className={`text-[0.6rem] font-bold uppercase tracking-widest ${user.status === "active" ? "text-green-400" : "text-red-400"}`}>{user.status}</span>
                          </td>
                          <td className="p-6 text-right">
                            <button onClick={() => banUser(user.id)} className={`p-2 rounded-xl transition-all ${user.status === "active" ? "hover:bg-red-500/10 text-red-500/50 hover:text-red-500" : "hover:bg-green-500/10 text-green-500/50 hover:text-green-500"}`}>
                              {user.status === "active" ? <UserMinus size={18} /> : <UserCheck size={18} />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
