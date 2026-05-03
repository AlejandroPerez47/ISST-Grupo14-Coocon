"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LogOut, CheckCircle, Calendar, BedDouble, User, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ReservationSummary {
  id: string;
  guestDni: string;
  capsuleId: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function CheckOutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [dniInput, setDniInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [reservation, setReservation] = useState<ReservationSummary | null>(null);

  /* ── STEP 1: buscar reserva por DNI ── */
  const handleSearch = async () => {
    if (!dniInput.trim()) { toast.error("Introduce tu DNI primero."); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/v1/checkout/by-dni/${dniInput.trim().toUpperCase()}`);
      if (!res.ok) { toast.error("No se encontró ninguna reserva con check-in activo para ese DNI."); return; }
      const data: ReservationSummary = await res.json();
      setReservation(data);
      setStep(2);
    } catch { toast.error("Error de conexión."); }
    finally { setSearching(false); }
  };

  /* ── STEP 2: confirmar checkout ── */
  const handleConfirmCheckOut = async () => {
    if (!reservation) return;
    setConfirming(true);
    try {
      const res = await fetch(`/api/v1/checkout/${reservation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestDni: reservation.guestDni }),
      });
      if (!res.ok) { toast.error(await res.text()); return; }
      setStep(3);
    } catch { toast.error("Error de conexión."); }
    finally { setConfirming(false); }
  };

  /* ── helpers ── */
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });

  const nightsBetween = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  };

  const stepLabel =
    step === 1 ? "Introduce tu DNI" : step === 2 ? "Confirma tu salida" : "¡Hasta pronto!";

  return (
    <div className="min-h-screen bg-[#F5EFE6] max-w-md mx-auto flex flex-col">

      {/* Gradient header */}
      <div
        className="relative px-5 pt-12 pb-8 rounded-b-[2.5rem]"
        style={{ background: "linear-gradient(160deg, #1B2F6E 0%, #4ABDE8 100%)" }}
      >
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : router.back()}
          className="absolute top-6 left-5 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={22} />
        </button>

        {/* Step indicator */}
        <div className="flex gap-2 mb-5 mt-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 rounded-full flex-1 transition-all ${step >= s ? "bg-white" : "bg-white/30"}`} />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <LogOut size={18} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">Check-out Digital</h1>
            <p className="text-white/70 text-sm mt-0.5">{stepLabel}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4 pb-28 flex-1">

        {/* STEP 1 — DNI */}
        {step === 1 && (
          <div className="card space-y-6">
            <div>
              <label className="form-label">DNI / NIF del titular</label>
              <input
                className="input-underline text-lg"
                placeholder="12345678A"
                value={dniInput}
                onChange={e => setDniInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
              <p className="text-slate-400 text-xs mt-2">
                Buscaremos tu reserva activa y la daremos por finalizada.
              </p>
            </div>

            {/* Info callout */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Asegúrate de haber recogido todos tus objetos personales antes de
                completar el check-out. El acceso a la cápsula quedará desactivado.
              </p>
            </div>

            <button
              onClick={handleSearch}
              disabled={searching}
              className="btn-primary w-full"
            >
              {searching ? "Buscando reserva…" : <> Buscar mi reserva <ArrowRight size={16} /> </>}
            </button>
          </div>
        )}

        {/* STEP 2 — Resumen + Confirmar */}
        {step === 2 && reservation && (
          <div className="space-y-4">

            {/* Reservation summary card */}
            <div className="card space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-[#1B2F6E]/10 flex items-center justify-center">
                  <User size={20} className="text-[#1B2F6E]" />
                </div>
                <div>
                  <p className="font-bold text-[#1B2F6E] text-sm">Titular de la reserva</p>
                  <p className="text-slate-400 text-xs">DNI: {reservation.guestDni}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Capsule */}
                <div className="bg-[#F5EFE6] rounded-2xl p-3 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[#1B2F6E]">
                    <BedDouble size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wide">Cápsula</span>
                  </div>
                  <p className="text-[#1B2F6E] font-bold text-sm truncate">
                    {reservation.capsuleId.slice(0, 8).toUpperCase()}…
                  </p>
                </div>

                {/* Nights */}
                <div className="bg-[#F5EFE6] rounded-2xl p-3 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[#1B2F6E]">
                    <Calendar size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wide">Noches</span>
                  </div>
                  <p className="text-[#1B2F6E] font-bold text-sm">
                    {nightsBetween(reservation.startDate, reservation.endDate)} noche
                    {nightsBetween(reservation.startDate, reservation.endDate) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Entrada</span>
                  <span className="font-semibold text-[#1B2F6E]">{formatDate(reservation.startDate)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Salida</span>
                  <span className="font-semibold text-[#1B2F6E]">{formatDate(reservation.endDate)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Estado</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4ABDE8]/10 text-[#4ABDE8] font-semibold text-xs">
                    ● Check-in activo
                  </span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 leading-relaxed">
                <strong>Esta acción es irreversible.</strong> Una vez confirmado, el acceso
                a tu cápsula quedará desactivado y la reserva se marcará como completada.
              </p>
            </div>

            <button
              onClick={handleConfirmCheckOut}
              disabled={confirming}
              className="btn-primary w-full mt-2 !bg-red-500 hover:!bg-red-600 !shadow-red-300/30"
            >
              {confirming ? "Procesando…" : <> Confirmar Check-out <LogOut size={16} /> </>}
            </button>
          </div>
        )}

        {/* STEP 3 — Success */}
        {step === 3 && (
          <div className="card text-center space-y-5 py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-500 mx-auto">
              <CheckCircle size={44} strokeWidth={1.5} />
            </div>

            <div>
              <h2 className="text-[#1B2F6E] text-xl font-bold">¡Check-out completado!</h2>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Tu estancia ha finalizado correctamente.<br />
                Esperamos verte pronto en Tourist Cocoon.
              </p>
            </div>

            <div className="bg-[#1B2F6E]/5 border border-[#1B2F6E]/10 rounded-2xl p-4 space-y-2 text-left">
              <p className="text-xs text-[#1B2F6E] font-semibold">🙏 Gracias por tu estancia</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                El acceso a la cápsula ha sido desactivado y la reserva marcada como completada.
                Si dejaste algo olvidado, contacta con recepción.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button onClick={() => router.push("/")} className="btn-primary w-full">
                Volver al inicio <ArrowRight size={16} />
              </button>
              <button
                onClick={() => router.push("/reservations/new")}
                className="btn-primary w-full !bg-white !text-[#1B2F6E] !shadow-none border border-slate-200 hover:!bg-slate-50"
              >
                Nueva reserva <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
