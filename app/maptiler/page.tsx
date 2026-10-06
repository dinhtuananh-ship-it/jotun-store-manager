import React from 'react';
import MapTilerMap from '@/components/MapTilerMap';

export const metadata = {
  title: 'MapTiler Demo',
  description: 'Demo trang bản đồ sử dụng MapTiler SDK',
};

export default function MapTilerDemoPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Bản đồ MapTiler</h1>
      <p className="mb-6 text-gray-600">
        Đây là trang demo tích hợp MapTiler SDK vào Next.js. Bản đồ đã được thiết lập với control điều hướng và một marker tại trung tâm.
      </p>
      
      <MapTilerMap />
    </div>
  );
}
