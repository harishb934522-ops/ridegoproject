import { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function LiveRideMap({
  pickupName = 'Pickup',
  dropName = 'Drop',
  vehicleType = 'Bike Taxi',
  interactive = false,
  onLocationSelect = null,
  height = '380px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default coordinates (Chennai Metropolitan Area corridor)
    const defaultPickupCoords = [13.0827, 80.2707];
    const defaultDropCoords = [12.9941, 80.2425];
    const routeWaypoints = [
      [13.0827, 80.2707],
      [13.0604, 80.2496],
      [13.0382, 80.2345],
      [13.0125, 80.2310],
      [12.9941, 80.2425],
    ];

    const getVehicleEmoji = (type) => {
      const t = (type || '').toLowerCase();
      if (t.includes('auto')) return '🛺';
      if (t.includes('parcel')) return '📦';
      return '🏍️';
    };

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultPickupCoords,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: interactive,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Pickup Marker
      const pickupIcon = L.divIcon({
        className: 'ridego-map-pin',
        html: `<div style="background:#fff; border:2px solid #28a745; border-radius:50px; padding:4px 10px; font-weight:700; font-size:12px; box-shadow:0 3px 10px rgba(0,0,0,0.3); display:flex; align-items:center; gap:4px; white-space:nowrap;">
                 <span style="color:#28a745; font-size:14px;">📍</span> ${pickupName}
               </div>`,
        iconSize: [120, 30],
        iconAnchor: [60, 15],
      });
      L.marker(defaultPickupCoords, { icon: pickupIcon }).addTo(map);

      // Drop Marker
      const dropIcon = L.divIcon({
        className: 'ridego-map-pin',
        html: `<div style="background:#fff; border:2px solid #dc3545; border-radius:50px; padding:4px 10px; font-weight:700; font-size:12px; box-shadow:0 3px 10px rgba(0,0,0,0.3); display:flex; align-items:center; gap:4px; white-space:nowrap;">
                 <span style="color:#dc3545; font-size:14px;">🏁</span> ${dropName}
               </div>`,
        iconSize: [120, 30],
        iconAnchor: [60, 15],
      });
      L.marker(defaultDropCoords, { icon: dropIcon }).addTo(map);

      // Route Polyline
      const polyline = L.polyline(routeWaypoints, {
        color: '#ffc107',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        dashArray: '2, 8',
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

      // Driver Live Marker
      const emoji = getVehicleEmoji(vehicleType);
      const driverIcon = L.divIcon({
        className: 'ridego-driver-pin',
        html: `<div style="background:#ffc107; color:#000; width:44px; height:44px; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:22px; box-shadow:0 0 15px rgba(255,193,7,0.8); border:3px solid #fff; animation:pulse 1.5s infinite;">
                 ${emoji}
               </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const initialDriverPos = routeWaypoints[1];
      const driverMarker = L.marker(initialDriverPos, { icon: driverIcon }).addTo(map);
      driverMarkerRef.current = driverMarker;

      if (interactive && onLocationSelect) {
        map.on('click', (e) => {
          onLocationSelect({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
          });
        });
      }

      mapInstanceRef.current = map;
    }

    let waypointIndex = 0;
    const interval = setInterval(() => {
      if (driverMarkerRef.current && routeWaypoints.length > 0) {
        waypointIndex = (waypointIndex + 1) % routeWaypoints.length;
        const nextCoord = routeWaypoints[waypointIndex];
        driverMarkerRef.current.setLatLng(nextCoord);
      }
    }, 2800);

    return () => {
      clearInterval(interval);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [pickupName, dropName, vehicleType, interactive, onLocationSelect]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height,
        borderRadius: '20px',
        overflow: 'hidden',
        zIndex: 1,
        boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
      }}
    />
  );
}
