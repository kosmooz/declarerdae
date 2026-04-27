"use client";

import { useRef, useEffect } from "react";
import L from "leaflet";
import type { DaeResult } from "@/lib/geodae-search";

interface Props {
  results: DaeResult[];
  onMapMove: (lat: number, lng: number, radiusKm: number) => void;
}

export default function DaeMapFranceMapInner({ results, onMapMove }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const onMapMoveRef = useRef(onMapMove);
  onMapMoveRef.current = onMapMove;

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [46.603354, 1.888334],
      zoom: 6,
      scrollWheelZoom: false,
      attributionControl: false,
      zoomControl: true,
      dragging: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 },
    ).addTo(map);

    let moveTimer: ReturnType<typeof setTimeout>;
    map.on("moveend", () => {
      clearTimeout(moveTimer);
      moveTimer = setTimeout(() => {
        const center = map.getCenter();
        const bounds = map.getBounds();
        const ne = bounds.getNorthEast();
        const radiusKm =
          L.latLng(center.lat, center.lng).distanceTo(
            L.latLng(ne.lat, ne.lng),
          ) / 1000;
        onMapMoveRef.current(center.lat, center.lng, radiusKm);
      }, 400);
    });

    mapRef.current = map;

    // Fire initial load
    const c = map.getCenter();
    const b = map.getBounds();
    const ne = b.getNorthEast();
    const r =
      L.latLng(c.lat, c.lng).distanceTo(L.latLng(ne.lat, ne.lng)) / 1000;
    onMapMoveRef.current(c.lat, c.lng, r);

    return () => {
      clearTimeout(moveTimer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const dae of results) {
      const marker = L.circleMarker([dae.lat, dae.lng], {
        radius: 6,
        fillColor: "#E1000F",
        fillOpacity: 0.85,
        color: "#fff",
        weight: 1.5,
      });

      marker.bindPopup(
        `<div style="font-family:'Source Sans 3',sans-serif;min-width:160px;">
          <div style="font-weight:700;font-size:13px;color:#000091;margin-bottom:2px;">${dae.nom}</div>
          <div style="font-size:12px;color:#3A3A3A;">${dae.adrNum} ${dae.adrVoie}</div>
          <div style="font-size:12px;color:#3A3A3A;">${dae.comCp} ${dae.comNom}</div>
        </div>`,
        { closeButton: false, maxWidth: 260 },
      );

      marker.addTo(map);
      markersRef.current.push(marker);
    }
  }, [results]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg"
      style={{ height: 420 }}
    />
  );
}
