"use client";

import { useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet.markercluster";

interface MapPoint {
  lat: number;
  lng: number;
  ville: string;
  cp: string;
  n: number;
}

interface DaeMapFranceInnerProps {
  points: MapPoint[];
}

export default function DaeMapFranceInner({ points }: DaeMapFranceInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [46.603354, 1.888334],
      zoom: 6,
      scrollWheelZoom: false,
      attributionControl: false,
      zoomControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 },
    ).addTo(map);

    const createClusterIcon = (cluster: any) => {
      const count = cluster.getChildCount();
      let size = 36;
      let fontSize = 13;
      if (count >= 10) { size = 44; fontSize = 14; }
      if (count >= 50) { size = 52; fontSize = 15; }

      return L.divIcon({
        html: `<div style="
          width:${size}px;height:${size}px;
          display:flex;align-items:center;justify-content:center;
          background:#000091;color:#fff;
          border-radius:50%;border:3px solid #fff;
          font-weight:700;font-size:${fontSize}px;
          font-family:'Libre Franklin',sans-serif;
          box-shadow:0 2px 8px rgba(0,0,0,0.25);
        ">${count}</div>`,
        className: "",
        iconSize: L.point(size, size),
      });
    };

    const clusterGroup = (L as any).markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: createClusterIcon,
    });

    for (const pt of points) {
      const marker = L.circleMarker([pt.lat, pt.lng], {
        radius: 7,
        fillColor: "#E1000F",
        fillOpacity: 0.9,
        color: "#fff",
        weight: 2,
      });

      const label = pt.n === 1 ? "1 DAE" : `${pt.n} DAE`;
      const villeLabel = pt.ville || "Localisation";
      marker.bindPopup(
        `<div style="font-family:'Source Sans 3',sans-serif;text-align:center;padding:2px 0;">
          <div style="font-weight:700;font-size:14px;color:#000091;">${villeLabel}</div>
          <div style="font-size:13px;color:#3A3A3A;margin-top:2px;">${label}</div>
        </div>`,
        { closeButton: false, className: "dae-map-popup" },
      );

      clusterGroup.addLayer(marker);
    }

    map.addLayer(clusterGroup);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [points]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full rounded-lg overflow-hidden"
      style={{ height: "100%" }}
    />
  );
}
