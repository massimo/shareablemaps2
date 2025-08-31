'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';
import UserAvatarMenu from '@/components/auth/UserAvatarMenu';
import EditableMapTitle from '@/components/editor/EditableMapTitle';

export default function Topbar() {
  const pathname = usePathname();
  
  // Check if we're in a map editor page
  const isMapEditor = pathname?.startsWith('/dashboard/maps/') && pathname !== '/dashboard/maps';
  const mapId = isMapEditor ? pathname?.split('/')[2] : null;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center min-w-0 flex-1">
          {isMapEditor && mapId ? (
            <EditableMapTitle mapId={mapId} />
          ) : (
            <h1 className="text-xl font-semibold text-gray-900">
              Shareable Maps
            </h1>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Global Search */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
            aria-label="Global search (Cmd+K)"
            title="Global search (Cmd+K)"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
            aria-label="Notifications"
          >
            <BellIcon className="h-5 w-5" />
          </button>

          {/* User Avatar Menu */}
          <UserAvatarMenu />
        </div>
      </div>
    </div>
  );
}
