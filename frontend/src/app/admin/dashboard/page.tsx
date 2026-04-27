"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, PlusCircle, CalendarDays, Bed, Activity, Loader2, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { format, addDays, subDays, isSameDay, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// Types for Audit
type AuditLog = {
  timestamp: string;
  action: string;
  guestDni: string;
};

type AuditReservation = {
  startDate: string;
  endDate: string;
  status: string;
  guestName: string;
};

type AuditCapsule = {
  capsuleId: string;
  roomNumber: number;
  reservations: AuditReservation[];
  accessLogs: AuditLog[];
};

export default function AdminDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Tabs: 'overview' | 'audit'
  const [activeTab, setActiveTab] = useState<'overview' | 'audit'>('overview');

  // Metrics State
  const [metrics, setMetrics] = useState({
    totalCapsules: 0,
    occupiedCapsules: 0,
    freeCapsules: 0,
    activeReservations: 0,
    futureReservations: 0,
    totalReservations: 0
  });

  // Audit State
  const [auditData, setAuditData] = useState<AuditCapsule[]>([]);

  // Capsule Form State
  const [showCapsuleForm, setShowCapsuleForm] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [savingCapsule, setSavingCapsule] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    const token = localStorage.getItem("auth_token");
    const name = localStorage.getItem("user_name");

    if (!token || role !== "ADMIN") {
      router.push("/login");
      return;
    }
    setUserName(name || "Admin");

    fetchMetrics();
    fetchAuditData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/v1/admin/dashboard", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch {
      toast.error("Error de conexión (Métricas)");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/v1/admin/audit-calendar", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditData(data);
      }
    } catch {
      toast.error("Error al cargar la auditoría");
    }
  };

  const handleCreateCapsule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber) return;

    setSavingCapsule(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/v1/admin/capsules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ roomNumber: parseInt(roomNumber, 10) })
      });

      if (res.ok) {
        toast.success("Cápsula Añadida Correctamente");
        setRoomNumber("");
        setShowCapsuleForm(false);
        fetchMetrics();
        fetchAuditData();
      } else {
        const errorMsg = await res.text();
        toast.error(errorMsg || "Error al crear la cápsula");
      }
    } catch {
      toast.error("Error de conexión al guardar");
    } finally {
      setSavingCapsule(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // ── CALENDAR LOGIC ──
  // Generar un rango de días desde hace 3 días hasta dentro de 10 días
  const today = new Date();
  const calendarDays = Array.from({ length: 14 }).map((_, i) => subDays(addDays(today, 10), 13 - i));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B2F6E] flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans max-w-5xl mx-auto md:p-6 p-0">
      
      {/* ── HEADER ── */}
      <div className="bg-[#1B2F6E] md:rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-sky/20 rounded-full blur-3xl mix-blend-screen" />
        
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <span className="text-white font-black text-2xl uppercase">{userName.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sky font-bold tracking-widest text-xs uppercase">Gestor de Hotel</p>
              <h1 className="text-white text-2xl font-bold">Portal del GESTOR</h1>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all backdrop-blur-md border border-white/10"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-4 mt-8 relative z-10 border-b border-white/10">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-2 font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'overview' ? 'border-sky text-sky' : 'border-transparent text-white/50 hover:text-white'}`}
          >
            <LayoutDashboard size={18} />
            Visión General
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-2 font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'audit' ? 'border-sky text-sky' : 'border-transparent text-white/50 hover:text-white'}`}
          >
            <ShieldCheck size={18} />
            Auditoría de Accesos
          </button>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="p-4 md:p-0 mt-6">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex justify-end">
               <button 
                 onClick={() => setShowCapsuleForm(!showCapsuleForm)}
                 className="bg-[#1B2F6E] hover:bg-[#11204F] text-white font-black py-2.5 px-5 rounded-xl shadow-xl hover:shadow-navy/20 transition-all flex items-center gap-2 text-sm tracking-wide"
                >
                 <PlusCircle size={18} />
                 Añadir Cápsula
               </button>
            </div>

            {/* CREATE CAPSULE FORM */}
            {showCapsuleForm && (
              <div className="bg-sky/5 border-2 border-sky/20 rounded-3xl p-6 animate-in fade-in slide-in-from-top-4">
                <h3 className="font-bold text-navy mb-4 flex items-center gap-2">
                  <PlusCircle size={20} className="text-sky" />
                  Registrar Nueva Cápsula en Inventario
                </h3>
                <form onSubmit={handleCreateCapsule} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-navy text-sm font-bold mb-2">Número de Habitación / Identificador</label>
                    <input 
                      type="number" 
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="Ej: 101" 
                      required
                      className="w-full bg-white border border-sky/30 rounded-xl py-3 px-4 text-navy focus:outline-none focus:ring-2 focus:ring-sky"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={savingCapsule}
                    className="bg-[#1B2F6E] hover:bg-[#11204F] text-white font-black py-3 px-8 rounded-xl shadow-xl transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                  >
                    {savingCapsule ? 'Guardando...' : 'Guardar y Publicar'}
                  </button>
                </form>
              </div>
            )}

            {/* METRICS WIDGETS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => router.push('/admin/guests')}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-1 items-start text-left hover:shadow-md hover:border-emerald-200 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-2 relative z-10">
                  <Activity size={24} />
                </div>
                <p className="text-3xl font-black text-slate-800 relative z-10">{metrics.activeReservations}</p>
                <p className="text-slate-500 font-medium text-sm relative z-10">Huéspedes Activos (In-House)</p>
                <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                  Ver listado completo <ArrowRight size={12} />
                </div>
              </button>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-1 items-start">
                <div className="p-3 bg-sky/10 text-sky rounded-xl mb-2">
                  <Bed size={24} />
                </div>
                <p className="text-3xl font-black text-slate-800">
                  {metrics.occupiedCapsules} <span className="text-lg text-slate-400 font-normal">/ {metrics.totalCapsules}</span>
                </p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                   <div className="bg-sky h-1.5 rounded-full" style={{ width: `${(metrics.occupiedCapsules / (metrics.totalCapsules||1)) * 100}%` }}></div>
                </div>
                <p className="text-slate-500 font-medium text-sm mt-1">Cápsulas Ocupadas</p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-1 items-start">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl mb-2">
                  <CalendarDays size={24} />
                </div>
                <p className="text-3xl font-black text-slate-800">{metrics.futureReservations}</p>
                <p className="text-slate-500 font-medium text-sm">Reservas Futuras (Pendientes)</p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-1 items-start justify-between">
                 <div>
                   <h3 className="font-bold text-slate-800">Cápsulas Libres</h3>
                   <p className="text-slate-500 text-sm">Unidades disponibles para venta</p>
                 </div>
                 <p className="text-5xl font-black text-emerald-500 mt-2">{metrics.freeCapsules}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── AUDIT TAB (CU 6) ── */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-[#1B2F6E] flex items-center gap-2">
                <Clock size={20} className="text-[#4ABDE8]" />
                Cuadrante de Auditoría de Accesos
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Visualización de estado de ocupación e historial inalterable de accesos por cápsula. 
                Pasa el ratón sobre los indicadores rojos para ver quién accedió y a qué hora.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200">
                    <th className="p-4 font-bold text-slate-700 min-w-[150px] sticky left-0 bg-slate-100/80 z-20 shadow-[1px_0_0_#e2e8f0]">Cápsula</th>
                    {calendarDays.map((date, i) => (
                      <th key={i} className={`p-3 text-center border-l border-slate-200 min-w-[80px] ${isSameDay(date, today) ? 'bg-sky/10 text-navy border-sky/30' : 'text-slate-600'}`}>
                        <div className="text-[10px] uppercase font-black tracking-widest opacity-60">
                          {format(date, 'EEE', { locale: es })}
                        </div>
                        <div className={`font-bold text-lg mt-0.5 ${isSameDay(date, today) ? 'text-sky' : ''}`}>
                          {format(date, 'd')}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditData.map((capsule) => (
                    <tr key={capsule.capsuleId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-[#1B2F6E] sticky left-0 bg-white z-10 shadow-[1px_0_0_#f1f5f9]">
                        Habitación {capsule.roomNumber}
                      </td>
                      {calendarDays.map((date, i) => {
                        // Comprobar si esta cápsula está reservada en este día
                        const reservationOnDay = capsule.reservations.find(r => 
                          isWithinInterval(date, { start: parseISO(r.startDate), end: parseISO(r.endDate) })
                        );
                        
                        // Buscar todos los logs de acceso en este día para esta cápsula
                        const logsOnDay = capsule.accessLogs.filter(log => 
                          isSameDay(parseISO(log.timestamp), date)
                        );

                        return (
                          <td 
                            key={i} 
                            className={`p-2 border-l border-slate-100 relative group
                              ${reservationOnDay ? 'bg-sky/10' : ''}
                              ${isSameDay(date, today) ? 'bg-sky/5' : ''}
                            `}
                          >
                            {/* Color block si está reservado */}
                            {reservationOnDay && (
                              <div className="absolute inset-y-1 inset-x-1 bg-[#4ABDE8]/20 rounded-md border border-[#4ABDE8]/30 pointer-events-none"></div>
                            )}

                            {/* Mostrar icono de acceso si hubo aperturas */}
                            {logsOnDay.length > 0 && (
                              <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center shadow-md shadow-rose-500/30 text-white cursor-help">
                                  <ShieldCheck size={16} />
                                  
                                  {/* Tooltip con los logs (Caso de Uso 6) */}
                                  <div className="absolute bottom-full mb-2 w-64 bg-[#1B2F6E] text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 group-hover:scale-100 z-50 shadow-2xl">
                                    <p className="font-bold border-b border-white/20 pb-2 mb-2 text-xs">
                                      Registro de Accesos - Hab {capsule.roomNumber}
                                    </p>
                                    <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                                      {logsOnDay.map((log, idx) => (
                                        <div key={idx} className="text-xs bg-white/10 p-2 rounded-lg">
                                          <div className="flex justify-between font-bold text-[#4ABDE8] mb-0.5">
                                            <span>{format(parseISO(log.timestamp), 'HH:mm:ss')}</span>
                                            <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
                                              Permitido
                                            </span>
                                          </div>
                                          <p>DNI: <span className="font-mono text-slate-300">{log.guestDni}</span></p>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1B2F6E] rotate-45"></div>
                                  </div>
                                </div>
                                {/* Badge contador si hay más de 1 acceso */}
                                {logsOnDay.length > 1 && (
                                  <div className="absolute -top-1 -right-1 bg-[#1B2F6E] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                                    {logsOnDay.length}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {auditData.length === 0 && (
                    <tr>
                      <td colSpan={calendarDays.length + 1} className="p-8 text-center text-slate-500">
                        No hay cápsulas configuradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#4ABDE8]/20 border border-[#4ABDE8]/30 rounded"></div>
                <span>Cápsula Reservada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                <span>Acceso Detectado (Log Inalterable)</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
