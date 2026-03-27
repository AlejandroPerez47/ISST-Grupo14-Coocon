import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5EFE6] flex flex-col max-w-md mx-auto">

      {/* ── HERO ── */}
      <div
        className="relative h-72 flex flex-col justify-end p-6 overflow-hidden rounded-b-[2.5rem]"
        style={{
          background: 'linear-gradient(160deg, #1B2F6E 0%, #4ABDE8 100%)',
        }}
      >
        {/* Logo watermark */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-black text-xl">C</span>
          </div>
          <span className="text-white/90 font-semibold text-sm">Tourist Cocoon</span>
        </div>

        {/* Rating badge */}
        <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
          <Star size={12} className="text-amber-300 fill-amber-300" />
          <span className="text-white text-xs font-semibold">4.8</span>
        </div>

        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-1 font-medium">Madrid, España</p>
          <h1 className="text-white text-3xl font-bold leading-tight mb-4">
            Urban Cube<br />Capsule Hotel
          </h1>
          <Link href="/reservations/new">
            <button className="btn-primary text-sm">
              Reservar ahora <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 px-4 pt-6 pb-28 space-y-6">

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: '/reservations/new', emoji: '🛏️', label: 'Reservar' },
            { href: '/checkin', emoji: '📲', label: 'Check-in' },
            { href: '/access', emoji: '🔑', label: 'Acceso' },
          ].map(a => (
            <Link key={a.href} href={a.href}>
              <div className="card flex flex-col items-center gap-2 py-4 cursor-pointer hover:shadow-2xl transition-all active:scale-95">
                <span className="text-2xl">{a.emoji}</span>
                <span className="text-xs font-semibold text-[#1B2F6E]">{a.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Info card */}
        <div className="card space-y-3">
          <h2 className="text-[#1B2F6E] font-bold text-lg">Tu estancia, sin colas</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Gestiona tu reserva, check-in legal y acceso a la cápsula
            todo desde tu móvil. Sin recepción, sin esperas.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {['Check-in 100% digital', 'PIN de 6 cifras', 'Sin recepción física', 'Registro legal'].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4ABDE8] flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Legal notice */}
        <div className="card bg-[#1B2F6E]/5 border border-[#1B2F6E]/10">
          <p className="text-xs text-[#1B2F6E]/70 leading-relaxed">
            ⚖️ Estancias limitadas a <strong>7 noches consecutivas</strong> y
            <strong> 15 días/mes</strong> según la Ley de Arrendamientos Urbanos.
          </p>
        </div>

      </div>
    </div>
  );
}
