"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, PlusCircle, CalendarDays, Bed, Activity, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Metrics State
  const [metrics, setMetrics] = useState({
    totalCapsules: 0,
    occupiedCapsules: 0,
    freeCapsules: 0,
    activeReservations: 0,
    futureReservations: 0,
    totalReservations: 0
  });

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
      } else {
        toast.error("Error al obtener estadísticas del hotel");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
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
        fetchMetrics(); // Refrescar métricas automáticamete
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B2F6E] flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans max-w-4xl mx-auto md:p-6 p-0">
      
      {/* ── HEADER ── */}
      <div className="bg-[#1B2F6E] md:rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl mix-blend-screen" />
        
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <span className="text-white font-black text-2xl uppercase">{userName.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sky-300 font-bold tracking-widest text-xs uppercase">Gestor de Hotel</p>
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
      </div>

      {/* ── DASHBOARD ACTIONS ── */}
      <div className="p-4 md:p-0 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="col-span-1 md:col-span-2 flex justify-between items-end pb-2">
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
             <LayoutDashboard size={20} className="text-sky-500"/>
             Visión General
           </h2>
           <button 
             onClick={() => setShowCapsuleForm(!showCapsuleForm)}
             className="bg-[#1B2F6E] hover:bg-[#11204F] text-white font-black py-2.5 px-5 rounded-xl shadow-xl hover:shadow-navy/20 transition-all flex items-center gap-2 text-sm tracking-wide"
            >
             <PlusCircle size={18} />
             Añadir Cápsula
           </button>
        </div>

        {/* ── METRICS WIDGETS ── */}
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
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl mb-2">
            <Bed size={24} />
          </div>
          <p className="text-3xl font-black text-slate-800">
            {metrics.occupiedCapsules} <span className="text-lg text-slate-400 font-normal">/ {metrics.totalCapsules}</span>
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
             <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${(metrics.occupiedCapsules / (metrics.totalCapsules||1)) * 100}%` }}></div>
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

      {/* ── CREATE CAPSULE MODAL INLINE ── */}
      {showCapsuleForm && (
        <div className="p-4 md:p-0 mt-4">
          <div className="bg-sky-50 border-2 border-sky-100 rounded-3xl p-6 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold text-sky-900 mb-4 flex items-center gap-2">
              <PlusCircle size={20} />
              Registrar Nueva Cápsula en Inventario
            </h3>
            <form onSubmit={handleCreateCapsule} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sky-800 text-sm font-bold mb-2">Número de Habitación / Identificador</label>
                <input 
                  type="number" 
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Ej: 101" 
                  required
                  className="w-full bg-white border border-sky-200 rounded-xl py-3 px-4 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
        </div>
      )}

    </div>
  );
}
