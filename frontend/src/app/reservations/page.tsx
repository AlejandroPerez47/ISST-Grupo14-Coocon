'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { reservationApi, type Reservation } from '@/lib/api';

const statusColor: Record<string, string> = {
  CONFIRMED:   'bg-blue-100 text-blue-700',
  CHECKED_IN:  'bg-green-100 text-green-700',
  CHECKED_OUT: 'bg-gray-100 text-gray-500',
  CANCELLED:   'bg-red-100 text-red-600',
  PENDING:     'bg-yellow-100 text-yellow-700',
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reservationApi.list().then(setReservations).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-12 text-gray-400">Cargando reservas…</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Reservas</h1>
        <Link href="/reservations/new" className="btn-primary">+ Nueva</Link>
      </div>

      {reservations.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No hay reservas registradas.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100">
          <table className="w-full text-sm bg-white">
            <thead className="bg-primary text-white">
              <tr>
                {['Código', 'Huésped', 'Tipo', 'Check-in', 'Check-out', 'Estado', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservations.map(r => (
                <tr key={r.id} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-mono font-medium">{r.reservationCode}</td>
                  <td className="px-4 py-3">{r.guestName}</td>
                  <td className="px-4 py-3">{r.roomType}</td>
                  <td className="px-4 py-3">{r.checkInDate}</td>
                  <td className="px-4 py-3">{r.checkOutDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/reservations/${r.id}`} className="text-primary-light hover:underline">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
