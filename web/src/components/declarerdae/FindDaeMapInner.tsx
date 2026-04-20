"use client";

import { useRef, useEffect } from "react";
import L from "leaflet";
import type { DaeResult } from "@/lib/geodae-search";
import { formatDistance, googleMapsDirectionsUrl } from "@/lib/geodae-search";

interface FindDaeMapInnerProps {
  results: DaeResult[];
  userLat: number | null;
  userLng: number | null;
  selectedGid: number | null;
  onSelectGid: (gid: number) => void;
  onMapMove: (lat: number, lng: number, radiusKm: number, userInitiated: boolean) => void;
  skipFitBounds: boolean;
}

const userIcon = L.divIcon({
  html: `<div style="
    width:18px;height:18px;
    background:#000091;
    border:3px solid #fff;
    border-radius:50%;
    box-shadow:0 0 0 3px rgba(0,0,145,0.3), 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  className: "",
  iconSize: L.point(18, 18),
  iconAnchor: L.point(9, 9),
});

export default function FindDaeMapInner({
  results,
  userLat,
  userLng,
  selectedGid,
  onSelectGid,
  onMapMove,
  skipFitBounds,
}: FindDaeMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.CircleMarker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const onMapMoveRef = useRef(onMapMove);
  onMapMoveRef.current = onMapMove;
  const programmaticMoveRef = useRef(false);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [46.603354, 1.888334],
      zoom: 6,
      scrollWheelZoom: true,
      attributionControl: false,
      zoomControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 },
    ).addTo(map);

    // Fire onMapMove on every moveend — always report position
    let moveTimer: ReturnType<typeof setTimeout>;
    map.on("moveend", () => {
      const wasProgram = programmaticMoveRef.current;
      programmaticMoveRef.current = false;
      clearTimeout(moveTimer);
      moveTimer = setTimeout(() => {
        const center = map.getCenter();
        const bounds = map.getBounds();
        const ne = bounds.getNorthEast();
        const radiusKm =
          L.latLng(center.lat, center.lng).distanceTo(
            L.latLng(ne.lat, ne.lng),
          ) / 1000;
        onMapMoveRef.current(center.lat, center.lng, radiusKm, !wasProgram);
      }, 400);
    });

    mapRef.current = map;

    // Report initial position immediately
    const initCenter = map.getCenter();
    const initBounds = map.getBounds();
    const initNe = initBounds.getNorthEast();
    const initRadius =
      L.latLng(initCenter.lat, initCenter.lng).distanceTo(
        L.latLng(initNe.lat, initNe.lng),
      ) / 1000;
    onMapMoveRef.current(initCenter.lat, initCenter.lng, initRadius, false);

    return () => {
      clearTimeout(moveTimer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when results change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    // User position marker
    if (userLat != null && userLng != null) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLat, userLng]);
      } else {
        userMarkerRef.current = L.marker([userLat, userLng], {
          icon: userIcon,
          zIndexOffset: 1000,
        })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:'Source Sans 3',sans-serif;text-align:center;font-weight:600;color:#000091;">Vous êtes ici</div>`,
            { closeButton: false },
          );
      }
    }

    // DAE markers
    for (const dae of results) {
      const marker = L.circleMarker([dae.lat, dae.lng], {
        radius: 8,
        fillColor: "#E1000F",
        fillOpacity: 0.9,
        color: "#fff",
        weight: 2,
      });

      const accBadge = dae.accLib
        ? `<span style="background:#18753C;color:#fff;padding:1px 6px;border-radius:10px;font-size:11px;">Accès libre</span>`
        : `<span style="background:#92400E;color:#fff;padding:1px 6px;border-radius:10px;font-size:11px;">Accès restreint</span>`;

      const accType =
        dae.acc === "Extérieur"
          ? `<span style="color:#18753C;font-size:12px;">Extérieur</span>`
          : `<span style="color:#000091;font-size:12px;">Intérieur</span>`;

      const mapsUrl = googleMapsDirectionsUrl(dae);
      const extras: string[] = [];
      if (dae.daeMobile) extras.push("DAE mobile");
      if (dae.lcPed) extras.push("Electrodes pédiatriques");

      marker.bindPopup(
        `<div style="font-family:'Source Sans 3',sans-serif;min-width:200px;">
          <div style="font-weight:700;font-size:14px;color:#000091;margin-bottom:4px;">${dae.nom}</div>
          <div style="font-size:12px;color:#3A3A3A;">${dae.adrNum} ${dae.adrVoie}</div>
          <div style="font-size:12px;color:#3A3A3A;margin-bottom:6px;">${dae.comCp} ${dae.comNom}</div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:6px;">
            ${accBadge} ${accType}
            <span style="font-weight:600;font-size:12px;color:#666;">${formatDistance(dae.distance)}</span>
          </div>
          ${dae.accComplt ? `<div style="font-size:11px;color:#929292;margin-bottom:4px;">${dae.accComplt}</div>` : ""}
          ${extras.length ? `<div style="font-size:11px;color:#666;margin-bottom:6px;">${extras.join(" &middot; ")}</div>` : ""}
          <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
             style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:#000091;color:#fff;border-radius:4px;font-size:12px;font-weight:600;text-decoration:none;">
            Itinéraire
          </a>
        </div>`,
        { closeButton: false, maxWidth: 300, className: "dae-find-popup" },
      );

      marker.on("click", () => onSelectGid(dae.gid));
      marker.addTo(map);
      markersRef.current.set(dae.gid, marker);
    }

    // Fit bounds only on initial search, not on map-move triggered reloads
    if (!skipFitBounds) {
      const allPoints: L.LatLngExpression[] = results.map((d) => [d.lat, d.lng]);
      if (userLat != null && userLng != null) {
        allPoints.push([userLat, userLng]);
      }
      if (allPoints.length > 0) {
        programmaticMoveRef.current = true;
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      } else if (userLat != null && userLng != null) {
        programmaticMoveRef.current = true;
        map.setView([userLat, userLng], 14);
      }
    }
  }, [results, userLat, userLng, onSelectGid, skipFitBounds]);

  // Highlight selected marker
  useEffect(() => {
    markersRef.current.forEach((marker, gid) => {
      if (gid === selectedGid) {
        marker.setStyle({ fillColor: "#000091", radius: 11, weight: 3 });
        marker.openPopup();
      } else {
        marker.setStyle({ fillColor: "#E1000F", radius: 8, weight: 2 });
      }
    });
  }, [selectedGid]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg"
      style={{ minHeight: 300 }}
    />
  );
}
