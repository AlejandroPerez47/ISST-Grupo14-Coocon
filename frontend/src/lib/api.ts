import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// ── Types ─────────────────────────────────────────────────────────
export type RoomType = 'SINGLE' | 'DOUBLE' | 'SUITE' | 'FAMILY';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

export interface CreateReservationPayload {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  roomType: RoomType;
  checkInDate: string;     // ISO date
  checkOutDate: string;    // ISO date
  numberOfGuests: number;
  specialRequests?: string;
}

export interface Reservation {
  id: string;
  reservationCode: string;
  guestName: string;
  guestEmail: string;
  roomType: RoomType;
  roomNumber: number | null;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  status: ReservationStatus;
  totalPrice: number;
  createdAt: string;
}

export interface CheckInPayload {
  documentType: 'DNI' | 'NIE' | 'PASSPORT';
  documentNumber: string;
  guests: { fullName: string; documentNumber: string; nationality?: string }[];
  paymentMethod?: 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'ONLINE_PREPAID';
}

export interface CheckInResult {
  reservationId: string;
  status: string;
  roomNumber: number;
  checkInTimestamp: string;
  message: string;
}

export interface AccessKey {
  reservationId: string;
  roomNumber: number;
  keyCode: string;
  validFrom: string;
  validUntil: string;
  issuedAt: string;
}

// ── API functions ─────────────────────────────────────────────────
export const reservationApi = {
  create: (data: CreateReservationPayload) =>
    api.post<Reservation>('/reservations', data).then(r => r.data),

  list: () =>
    api.get<Reservation[]>('/reservations').then(r => r.data),

  getById: (id: string) =>
    api.get<Reservation>(`/reservations/${id}`).then(r => r.data),

  cancel: (id: string) =>
    api.patch<Reservation>(`/reservations/${id}/cancel`).then(r => r.data),

  checkIn: (id: string, data: CheckInPayload) =>
    api.post<CheckInResult>(`/reservations/${id}/checkin`, data).then(r => r.data),

  generateKey: (id: string) =>
    api.post<AccessKey>(`/reservations/${id}/access-key`).then(r => r.data),

  getKey: (id: string) =>
    api.get<AccessKey>(`/reservations/${id}/access-key`).then(r => r.data),
};
