'use client';

// MapLibre wrapper that loads the GrabMaps style via /api/map-style,
// renders spots as a GeoJSON circle layer, and optionally draws a radius circle
// around the user.

import { useEffect, useRef } from 'react';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export type GrabMapSpot = {
  id: string;
  lat: number;
  lng: number;
  rarity: 'common' | 'rare' | 'legendary';
  claimed: boolean;
  name: string;
};

interface GrabMapProps {
  initialCenter: [number, number]; // [lng, lat]
  initialZoom?: number;
  spots?: GrabMapSpot[];
  radiusKm?: number;
  userLocation?: { lat: number; lng: number } | null;
  routeGeoJson?: GeoJSON.Feature<GeoJSON.LineString> | null;
  onSpotClick?: (spotId: string) => void;
  className?: string;
}

type FC = GeoJSON.FeatureCollection;

const EMPTY_FC: FC = { type: 'FeatureCollection', features: [] };

function spotsToFC(spots: GrabMapSpot[] | undefined): FC {
  if (!spots || spots.length === 0) return EMPTY_FC;
  return {
    type: 'FeatureCollection',
    features: spots.map((s) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
      properties: { id: s.id, rarity: s.rarity, claimed: s.claimed, name: s.name },
    })),
  };
}

function userToFC(u: { lat: number; lng: number } | null | undefined): FC {
  if (!u) return EMPTY_FC;
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [u.lng, u.lat] },
        properties: {},
      },
    ],
  };
}

// Build a 64-point polygon ring approximating a circle of `radiusKm` around
// `[lng,lat]`, using the standard spherical offset formula.
function circlePolygon(
  center: [number, number],
  radiusKm: number,
  steps = 64,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lng, lat] = center;
  const latRad = (lat * Math.PI) / 180;
  const km = radiusKm;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI;
    const dx = km * Math.cos(theta);
    const dy = km * Math.sin(theta);
    const dLng = dx / (111.32 * Math.cos(latRad));
    const dLat = dy / 110.574;
    coords.push([lng + dLng, lat + dLat]);
  }
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  };
}

function radiusFC(
  center: [number, number] | null,
  radiusKm: number | undefined,
): FC {
  if (!center || !radiusKm || radiusKm <= 0) return EMPTY_FC;
  return { type: 'FeatureCollection', features: [circlePolygon(center, radiusKm)] };
}

const EMPTY_LINE: GeoJSON.Feature<GeoJSON.LineString> = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: [] },
};

function routeToData(
  route: GeoJSON.Feature<GeoJSON.LineString> | null | undefined,
): GeoJSON.Feature<GeoJSON.LineString> {
  if (!route || !route.geometry || route.geometry.coordinates.length < 2) {
    return EMPTY_LINE;
  }
  return route;
}

export function GrabMap({
  initialCenter,
  initialZoom = 14,
  spots,
  radiusKm,
  userLocation,
  routeGeoJson,
  onSpotClick,
  className,
}: GrabMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const loadedRef = useRef(false);
  const onSpotClickRef = useRef(onSpotClick);
  const routeFittedRef = useRef(false);
  const spotsFittedRef = useRef(false);

  useEffect(() => {
    onSpotClickRef.current = onSpotClick;
  }, [onSpotClick]);

  // Mount + teardown the map once.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: '/api/map-style',
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.on('load', () => {
      loadedRef.current = true;

      map.addSource('radius', { type: 'geojson', data: EMPTY_FC });
      map.addLayer({
        id: 'radius-fill',
        type: 'fill',
        source: 'radius',
        paint: { 'fill-color': '#FF3D8A', 'fill-opacity': 0.15 },
      });
      map.addLayer({
        id: 'radius-stroke',
        type: 'line',
        source: 'radius',
        paint: { 'line-color': '#FF3D8A', 'line-opacity': 0.6, 'line-width': 2 },
      });

      // Route layers go under spots. Widths + opacities match
      // example/frontend/public/app.js (route-line-casing + route-line).
      map.addSource('route', { type: 'geojson', data: EMPTY_LINE });
      map.addLayer({
        id: 'route-casing',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#FFFFFF',
          'line-opacity': 0.92,
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 9, 15, 16],
        },
      });
      map.addLayer({
        id: 'route-stroke',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#00B14F',
          'line-opacity': 0.98,
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 5, 15, 10],
        },
      });

      map.addSource('spots', { type: 'geojson', data: EMPTY_FC });
      map.addLayer({
        id: 'spots-layer',
        type: 'circle',
        source: 'spots',
        paint: {
          'circle-radius': 10,
          'circle-color': [
            'match',
            ['get', 'rarity'],
            'legendary', '#FFB020',
            'rare', '#2A7FFF',
            '#8AA296',
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': [
            'case',
            ['get', 'claimed'], '#00B14F', '#FFFFFF',
          ],
        },
      });

      map.addSource('user', { type: 'geojson', data: EMPTY_FC });
      map.addLayer({
        id: 'user-halo',
        type: 'circle',
        source: 'user',
        paint: {
          'circle-radius': 18,
          'circle-color': '#2A7FFF',
          'circle-opacity': 0.18,
        },
      });
      map.addLayer({
        id: 'user-dot',
        type: 'circle',
        source: 'user',
        paint: {
          'circle-radius': 7,
          'circle-color': '#2A7FFF',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 3,
        },
      });

      // Seed sources with whatever the latest props are at load time.
      (map.getSource('spots') as maplibregl.GeoJSONSource).setData(spotsToFC(spots));
      (map.getSource('user') as maplibregl.GeoJSONSource).setData(userToFC(userLocation ?? null));
      (map.getSource('radius') as maplibregl.GeoJSONSource).setData(
        radiusFC(userLocation ? [userLocation.lng, userLocation.lat] : initialCenter, radiusKm),
      );
      (map.getSource('route') as maplibregl.GeoJSONSource).setData(
        routeToData(routeGeoJson ?? null),
      );
      if (
        !routeFittedRef.current &&
        routeGeoJson &&
        routeGeoJson.geometry.coordinates.length >= 2
      ) {
        const coords = routeGeoJson.geometry.coordinates;
        const bounds = coords.reduce(
          (b, c) => b.extend(c as [number, number]),
          new maplibregl.LngLatBounds(
            coords[0] as [number, number],
            coords[0] as [number, number],
          ),
        );
        map.fitBounds(bounds, { padding: 60, duration: 0 });
        routeFittedRef.current = true;
      }

      map.on('click', 'spots-layer', (e) => {
        const f = e.features?.[0];
        const id = f?.properties?.id as string | undefined;
        if (id && onSpotClickRef.current) onSpotClickRef.current(id);
      });
      map.on('mouseenter', 'spots-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'spots-layer', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    return () => {
      loadedRef.current = false;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update spots source when `spots` changes. Also fit the camera to the
  // spots bounds the first time a non-empty array arrives — this prevents the
  // map from stranding the user at the fallback centre when spots cluster off
  // the initial viewport (e.g. radius-mode origin != hunt origin while data
  // loads async). Route mode handles its own fit via routeFittedRef.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const src = map.getSource('spots') as maplibregl.GeoJSONSource | undefined;
    if (src) src.setData(spotsToFC(spots));

    if (
      !spotsFittedRef.current &&
      !routeFittedRef.current &&
      spots &&
      spots.length > 0
    ) {
      const first: [number, number] = [spots[0].lng, spots[0].lat];
      const bounds = spots.reduce(
        (b, s) => b.extend([s.lng, s.lat] as [number, number]),
        new maplibregl.LngLatBounds(first, first),
      );
      map.fitBounds(bounds, { padding: 80, maxZoom: 16, duration: 400 });
      spotsFittedRef.current = true;
    }
  }, [spots]);

  // Update user source when location changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const src = map.getSource('user') as maplibregl.GeoJSONSource | undefined;
    if (src) src.setData(userToFC(userLocation ?? null));
  }, [userLocation]);

  // Update radius polygon when radius or center changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const src = map.getSource('radius') as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    const center: [number, number] = userLocation
      ? [userLocation.lng, userLocation.lat]
      : initialCenter;
    src.setData(radiusFC(center, radiusKm));
  }, [radiusKm, userLocation, initialCenter]);

  // Update route line when prop changes. Fit bounds exactly once per mount.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const src = map.getSource('route') as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    src.setData(routeToData(routeGeoJson ?? null));
    if (
      !routeFittedRef.current &&
      routeGeoJson &&
      routeGeoJson.geometry.coordinates.length >= 2
    ) {
      const coords = routeGeoJson.geometry.coordinates;
      const bounds = coords.reduce(
        (b, c) => b.extend(c as [number, number]),
        new maplibregl.LngLatBounds(
          coords[0] as [number, number],
          coords[0] as [number, number],
        ),
      );
      map.fitBounds(bounds, { padding: 60, duration: 400 });
      routeFittedRef.current = true;
    }
  }, [routeGeoJson]);

  return <div ref={containerRef} className={className ?? 'w-full h-full'} />;
}

export default GrabMap;
