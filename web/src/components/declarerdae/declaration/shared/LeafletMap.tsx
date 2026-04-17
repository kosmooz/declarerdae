"use client";

import { useRef, useEffect, useCallback } from "react";
import L from "leaflet";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const MAPBOX_SATELLITE_URL = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;

const DEFAULT_CENTER: L.LatLngExpression = [46.603354, 1.888334];
const DEFAULT_ZOOM = 5;

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LeafletMapProps {
  lat: number | null;
  lng: number | null;
  onPositionChange: (lat: number, lng: number) => void;
  locatedZoom?: number;
}

export default function LeafletMap({
  lat,
  lng,
  onPositionChange,
  locatedZoom = 21,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onPositionChangeRef = useRef(onPositionChange);
  onPositionChangeRef.current = onPositionChange;
  const initialLatRef = useRef(lat);
  const initialLngRef = useRef(lng);
  const locatedZoomRef = useRef(locatedZoom);
  locatedZoomRef.current = locatedZoom;
  // Track whether a position change originated from map interaction (click/drag)
  // so the sync effect can skip the redundant flyTo that causes trembling.
  const fromMapRef = useRef(false);

  // Initialize map once — start at position if available
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const hasInitialPos = initialLatRef.current != null && initialLngRef.current != null;
    const center: L.LatLngExpression = hasInitialPos
      ? [initialLatRef.current!, initialLngRef.current!]
      : DEFAULT_CENTER;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: hasInitialPos ? locatedZoom : DEFAULT_ZOOM,
      scrollWheelZoom: true,
      attributionControl: false,
    });

    L.tileLayer(MAPBOX_SATELLITE_URL, {
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 22,
    }).addTo(map);

    // Crosshair cursor for click-to-place
    map.getContainer().style.cursor = "crosshair";

    const placeOrMoveMarker = (latlng: L.LatLng) => {
      if (markerRef.current) {
        markerRef.current.setLatLng(latlng);
      } else {
        const marker = L.marker(latlng, {
          icon: markerIcon,
          draggable: true,
        }).addTo(map);

        marker.on("dragend", () => {
          fromMapRef.current = true;
          const pos = marker.getLatLng();
          onPositionChangeRef.current(pos.lat, pos.lng);
        });

        markerRef.current = marker;
      }
    };

    // Place marker immediately if initial position exists
    if (hasInitialPos) {
      placeOrMoveMarker(L.latLng(center));
    }

    // Click on map to place/move marker
    map.on("click", (e: L.LeafletMouseEvent) => {
      fromMapRef.current = true;
      placeOrMoveMarker(e.latlng);
      onPositionChangeRef.current(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Sync marker with external lat/lng changes (e.g. geocoding selection)
  // Skips when the change came from map click/drag (already handled above).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || lat == null || lng == null) return;

    if (fromMapRef.current) {
      fromMapRef.current = false;
      return;
    }

    const pos: L.LatLngExpression = [lat, lng];

    if (markerRef.current) {
      markerRef.current.setLatLng(pos);
    } else {
      const marker = L.marker(pos, {
        icon: markerIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        fromMapRef.current = true;
        const latlng = marker.getLatLng();
        onPositionChangeRef.current(latlng.lat, latlng.lng);
      });

      markerRef.current = marker;
    }

    // Only animate if the map is not already at the target position.
    // Skips the redundant flyTo on initial mount (init effect already centered
    // the map) and avoids trembling from Strict Mode double-invocation.
    const dist = map.getCenter().distanceTo(L.latLng(lat, lng));
    if (dist > 1) {
      map.flyTo(pos, locatedZoomRef.current, { duration: 1 });
    }
  }, [lat, lng]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: 300, width: "100%" }}
      className="rounded-sm"
    />
  );
}
