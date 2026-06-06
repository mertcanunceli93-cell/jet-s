import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSocket } from '../hooks/useSocket';
import { Navigation } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Courier Icon
const courierIcon = L.divIcon({
  className: 'custom-courier-icon',
  html: `<div class="bg-brand-orange p-2 rounded-full shadow-[0_0_15px_rgba(255,122,0,0.6)] animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface TrackingMapProps {
  orderId: string;
  pickupCoords?: [number, number];
  deliveryCoords?: [number, number];
}

type CourierLocationPayload = {
  lat: number;
  lng: number;
};

export default function TrackingMap({ orderId, pickupCoords = [41.0082, 28.9784], deliveryCoords = [41.0407, 28.9868] }: TrackingMapProps) {
  const socket = useSocket();
  const [courierPos, setCourierPos] = useState<[number, number]>(pickupCoords);

  useEffect(() => {
    if (socket) {
      socket.on(`order_location:${orderId}`, (location: CourierLocationPayload) => {
        setCourierPos([location.lat, location.lng]);
      });
    }
    return () => {
      if (socket) socket.off(`order_location:${orderId}`);
    };
  }, [socket, orderId]);

  return (
    <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
      <MapContainer 
        center={pickupCoords} 
        zoom={13} 
        style={{ height: '100%', width: '100%', background: '#0B1220' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Pickup Marker */}
        <Marker position={pickupCoords}>
          <Popup>Alış Noktası</Popup>
        </Marker>

        {/* Delivery Marker */}
        <Marker position={deliveryCoords}>
          <Popup>Teslimat Noktası</Popup>
        </Marker>

        {/* Courier Marker */}
        <Marker position={courierPos} icon={courierIcon}>
          <Popup>Kuryeniz Burada</Popup>
        </Marker>
      </MapContainer>

      {/* Floating Info */}
      <div className="absolute bottom-6 left-6 right-6 z-[1000] flex gap-4">
        <div className="flex-1 bg-[#111827]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-orange/20 rounded-xl flex items-center justify-center text-brand-orange">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Kurye Konumu</div>
            <div className="text-white font-medium">Teslimat noktasına yaklaşıyor</div>
          </div>
        </div>
      </div>
    </div>
  );
}
