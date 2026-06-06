export interface User {
  id: string;
  email: string;
  role: 'USER' | 'COURIER' | 'ADMIN' | 'SUPERADMIN' | 'CORPORATE';
  createdAt: Date;
  updatedAt: Date;
}

export interface Courier {
  id: string;
  userId: string;
  vehicleType: 'MOTO' | 'CAR' | 'VAN';
  isOnline: boolean;
  currentLat?: number;
  currentLng?: number;
}
