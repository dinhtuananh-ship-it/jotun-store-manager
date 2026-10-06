"use client";

import React, { useRef, useEffect, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";

export default function MapTilerMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  
  // Toạ độ mặc định (Hồ Chí Minh, Việt Nam)
  const [lng] = useState(106.660172);
  const [lat] = useState(10.762622);
  const [zoom] = useState(10);

  useEffect(() => {
    // API key nên được lưu trong biến môi trường
    const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
    if (!apiKey) {
      console.error("MapTiler API Key is missing. Please add NEXT_PUBLIC_MAPTILER_API_KEY to your .env.local");
      return;
    }

    maptilersdk.config.apiKey = apiKey;

    if (map.current || !mapContainer.current) return; // Dừng nếu map đã được tạo
    
    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [lng, lat],
      zoom: zoom
    });

    // Thêm control điều hướng
    map.current.addControl(new maptilersdk.NavigationControl(), 'top-right');
    
    // Thêm marker mẫu
    new maptilersdk.Marker({color: "#FF0000"})
      .setLngLat([106.660172, 10.762622])
      .addTo(map.current);

  }, [lng, lat, zoom]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
}
