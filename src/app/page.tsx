'use client';

import React from 'react';
import AuthGate from '@/components/auth/AuthGate';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import StatsCards from '@/components/dashboard/StatsCards';

export default function Home() {
  return (
    <AuthGate>
      <div className="h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">
                  Overview of your maps and engagement metrics.
                </p>
              </div>

              <StatsCards />

              {/* Recent Activity - Placeholder for now */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-500 text-center">
                    Recent activity will appear here when you start creating and sharing maps.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGate>
  );
}
