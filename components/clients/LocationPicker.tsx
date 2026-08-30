"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// كومبوننت صغير بيصلح مشكلة الحجم بعد التحميل
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
}

type LatLng = { lat: number; lng: number };

export default function LocationPicker({
  initialPosition,
  onLocationChange,
}: {
  initialPosition?: LatLng;
  onLocationChange: (pos: LatLng) => void;
}) {
  const defaultPosition: LatLng = initialPosition ?? {
    lat: 32.8872,
    lng: 13.1913,
  };

  return (
    <div
      className="rounded-lg overflow-hidden border border-slate-200"
      style={{ height: "300px", width: "100%" }}
    >
      <MapContainer
        center={[defaultPosition.lat, defaultPosition.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <MapResizer />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          position={defaultPosition}
          onChange={onLocationChange}
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
