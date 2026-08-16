"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LocationViewer({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden border border-slate-200"
      style={{ height: "250px" }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        dragging={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  );
}
