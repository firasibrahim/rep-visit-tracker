"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// إصلاح مشكلة شائعة في Leaflet مع Next.js (أيقونة الـ Marker ما بتظهرش افتراضيًا)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type LatLng = { lat: number; lng: number };

export default function LocationPicker({
  initialPosition,
  onLocationChange,
}: {
  initialPosition?: LatLng;
  onLocationChange: (pos: LatLng) => void;
}) {
  // الإحداثيات الافتراضية: طرابلس، ليبيا
  const defaultPosition: LatLng = initialPosition ?? {
    lat: 32.8872,
    lng: 13.1913,
  };
  const [position, setPosition] = useState<LatLng>(defaultPosition);

  return (
    <div
      className="rounded-lg overflow-hidden border border-slate-200"
      style={{ height: "300px" }}
    >
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          position={position}
          onChange={(pos) => {
            setPosition(pos);
            onLocationChange(pos);
          }}
        />
      </MapContainer>
    </div>
  );
}

function LocationMarker({
  position,
  onChange,
}: {
  position: LatLng;
  onChange: (pos: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return <Marker position={[position.lat, position.lng]} />;
}
