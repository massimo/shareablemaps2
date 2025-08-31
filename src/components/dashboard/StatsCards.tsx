'use client';

import React from 'react';
import { MapIcon, EyeIcon, ChatBubbleLeftIcon, HeartIcon } from '@heroicons/react/24/outline';

interface StatCard {
  name: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function StatsCards() {
  // TODO: Replace with real data from Firebase
  const stats: StatCard[] = [
    {
      name: 'Maps Created',
      value: '0',
      icon: MapIcon,
      color: 'text-blue-600',
    },
    {
      name: 'Total Views',
      value: '0',
      icon: EyeIcon,
      color: 'text-green-600',
    },
    {
      name: 'Comments',
      value: '0',
      icon: ChatBubbleLeftIcon,
      color: 'text-purple-600',
    },
    {
      name: 'Likes',
      value: '0',
      icon: HeartIcon,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white overflow-hidden rounded-lg border border-gray-200 px-4 py-5 shadow-sm"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {stat.value}
              </dd>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
