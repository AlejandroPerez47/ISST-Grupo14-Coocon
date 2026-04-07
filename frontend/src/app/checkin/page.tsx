"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ScanLine, CheckCircle, User } from "lucide-react";
import toast from "react-hot-toast";

export default function CheckInPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [reservationId, setReservationId] = useState("");
  const [dniInput, setDniInput] = useState("");
  const [form, setForm] = useState({
    dni: "", firstName: "", lastName: "", email: "",
    acceptTerms: false,
  });
  const [pin, setPin] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleDniLookup = async () => {
    if (!dniInput.trim()) { toast.error("Introduce tu DNI primero."); return; }
    setScanning(true);
    try {
      const res = await fetch(`/api/v1/reservations/by-dni/${dniInput.trim().toUpperCase()}`);
      if (!res.ok) { toast.error("No se encontró una reserva activa para ese DNI."); return; }
      const data = await res.json();
      setReservationId(data.id);
      setForm(f => ({ ...f, dni: dniInput.trim().toUpperCase(), firstName: "", lastName: "" }));
      setStep(2);
    } catch { toast.error("Error de conexión."); }
    finally { setScanning(false); }
  };

  const handleCheckIn = async () => {
    if (!form.acceptTerms) { toast.error("Debes aceptar los términos."); return; }
    try {
      const res = await fetch(`/api/v1/checkin/${reservationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: form.dni, firstName: form.firstName, lastName: form.lastName, email: form.email }),
      });
      if (!res.ok) { toast.error(await res.text()); return; }
      const data = await res.json();
      setPin(data.accessPin);
      setStep(3);
    } catch { toast.error("Error de conexión."); }
  };

  return (
    <div className="min-h-screen bg-[#F5EFE6] max-w-md mx-auto flex flex-col">

      {/* Gradient header */}
      <div
        className="relative px-5 pt-12 pb-8 rounded-b-[2.5rem]"
        style={{ background: 'linear-gradient(160deg, #1B2F6E 0%, #4ABDE8 100%)' }}
      >
        <button onClick={() => step > 1 ? setStep(s => s - 1) : router.back()} className="absolute top-6 left-5 text-white/70 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <div className="flex gap-2 mb-5 mt-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 rounded-full flex-1 transition-all ${step >= s ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
        <h1 className="text-white text-2xl font-bold">Check-in Digital</h1>
        <p className="text-white/70 text-sm mt-1">
          {step === 1 ? 'Introduce tu DNI' : step === 2 ? 'Confirma tus datos' : '¡Todo listo!'}
        </p>
      </div>

      <div className="px-4 mt-4 pb-28 flex-1">

        {/* STEP 1 — DNI lookup */}
        {step === 1 && (
          <div className="card space-y-5">
            <div>
              <label className="form-label">DNI / NIF del titular de la reserva</label>
              <input
                className="input-underline"
                placeholder="12345678A"
                value={dniInput}
                onChange={e => setDniInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDniLookup()}
              />
            </div>

            <div
              onClick={handleDniLookup}
              className="border-2 border-dashed border-[#4ABDE8]/50 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:bg-[#4ABDE8]/5 active:scale-95 transition-all"
            >
              <div className={`p-5 rounded-full ${scanning ? 'bg-[#4ABDE8]/20 animate-pulse' : 'bg-[#4ABDE8]/10'}`}>
                <ScanLine size={36} className="text-[#4ABDE8]" strokeWidth={1.5} />
              </div>
              <p className="text-[#1B2F6E] font-semibold text-sm">
                {scanning ? 'Buscando reserva…' : 'Pulsa para buscar tu reserva'}
              </p>
              <p className="text-slate-400 text-xs text-center">Buscaremos tu reserva activa por DNI automáticamente</p>
            </div>
          </div>
        )}

        {/* STEP 2 — Confirm data */}
        {step === 2 && (
          <div className="card space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-[#1B2F6E]/10 flex items-center justify-center">
                <User size={20} className="text-[#1B2F6E]" />
              </div>
              <div>
                <p className="font-semibold text-[#1B2F6E] text-sm">{form.firstName} {form.lastName}</p>
                <p className="text-slate-400 text-xs">DNI: {form.dni}</p>
              </div>
            </div>
            <div>
              <label className="form-label">Nombre</label>
              <input className="input-underline" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Apellidos</label>
              <input className="input-underline" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">DNI / NIF</label>
              <input className="input-underline" value={form.dni} onChange={e => setForm(f => ({ ...f, dni: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" className="input-underline" placeholder="tu@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer mt-2">
              <input type="checkbox" className="w-4 h-4 accent-[#4ABDE8]" checked={form.acceptTerms} onChange={e => setForm(f => ({ ...f, acceptTerms: e.target.checked }))} />
              <span className="text-xs text-slate-500">Acepto los <span className="text-[#4ABDE8] font-medium underline cursor-pointer">Términos y Condiciones</span></span>
            </label>
            <button onClick={handleCheckIn} className="btn-primary w-full mt-2">
              Completar Check-in <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 3 — Success + PIN */}
        {step === 3 && (
          <div className="card text-center space-y-5 py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#4ABDE8]/15 text-[#4ABDE8] mx-auto">
              <CheckCircle size={44} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-[#1B2F6E] text-xl font-bold">¡Check-in completado!</h2>
              <p className="text-slate-500 text-sm mt-1">Tu código de acceso a la cápsula es:</p>
            </div>
            <div className="bg-[#1B2F6E] rounded-2xl py-6 px-4">
              <p className="text-[#4ABDE8] text-xs font-semibold tracking-widest mb-2">CÓDIGO DE ACCESO</p>
              <p className="text-white text-5xl font-black tracking-[0.25em] font-mono">{pin}</p>
            </div>
            <p className="text-xs text-slate-400">Guarda este código. Lo necesitarás para abrir tu cápsula.</p>
            <button onClick={() => router.push('/access')} className="btn-primary w-full">
              Ir a Acceso <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
