'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { reservationApi, type CreateReservationPayload } from '@/lib/api';

const schema = z.object({
  guestName:      z.string().min(2, 'Nombre requerido'),
  guestEmail:     z.string().email('Email inválido'),
  guestPhone:     z.string().optional(),
  roomType:       z.enum(['SINGLE', 'DOUBLE', 'SUITE', 'FAMILY']),
  checkInDate:    z.string().min(1, 'Fecha de entrada requerida'),
  checkOutDate:   z.string().min(1, 'Fecha de salida requerida'),
  numberOfGuests: z.coerce.number().min(1).max(6),
  specialRequests: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ReservationForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { numberOfGuests: 1, roomType: 'DOUBLE' },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const reservation = await reservationApi.create(data as CreateReservationPayload);
      toast.success(`Reserva ${reservation.reservationCode} creada con éxito`);
      router.push(`/reservations/${reservation.id}`);
    } catch {
      toast.error('Error al crear la reserva. Inténtalo de nuevo.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card max-w-2xl mx-auto space-y-5">
      <h2 className="text-2xl font-bold text-primary">Nueva Reserva</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre del huésped</label>
          <input {...register('guestName')} className="form-input" placeholder="Ana García" />
          {errors.guestName && <p className="text-red-500 text-xs mt-1">{errors.guestName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input {...register('guestEmail')} type="email" className="form-input" placeholder="ana@email.com" />
          {errors.guestEmail && <p className="text-red-500 text-xs mt-1">{errors.guestEmail.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input {...register('guestPhone')} className="form-input" placeholder="+34 600 000 000" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de habitación</label>
          <select {...register('roomType')} className="form-input">
            <option value="SINGLE">Individual</option>
            <option value="DOUBLE">Doble</option>
            <option value="SUITE">Suite</option>
            <option value="FAMILY">Familiar</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Check-in</label>
          <input {...register('checkInDate')} type="date" className="form-input" />
          {errors.checkInDate && <p className="text-red-500 text-xs mt-1">{errors.checkInDate.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Check-out</label>
          <input {...register('checkOutDate')} type="date" className="form-input" />
          {errors.checkOutDate && <p className="text-red-500 text-xs mt-1">{errors.checkOutDate.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Número de huéspedes</label>
          <input {...register('numberOfGuests')} type="number" min={1} max={6} className="form-input" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Solicitudes especiales</label>
        <textarea {...register('specialRequests')} rows={3} className="form-input" placeholder="Cama supletoria, vista al mar…" />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Creando reserva…' : 'Confirmar Reserva'}
      </button>
    </form>
  );
}
