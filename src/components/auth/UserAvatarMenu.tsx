'use client';

import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from './AuthProvider';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function UserAvatarMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
          <span className="sr-only">Open user menu</span>
          {user.photoURL ? (
            <img
              className="h-8 w-8 rounded-full"
              src={user.photoURL}
              alt={user.displayName || 'User avatar'}
            />
          ) : (
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
          )}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
            <div className="font-medium">{user.displayName || 'User'}</div>
            <div className="text-gray-500">{user.email}</div>
          </div>
          
          <Menu.Item>
            {({ active }) => (
              <a
                href="/settings"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'flex px-4 py-2 text-sm text-gray-700 items-center'
                )}
              >
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Settings
              </a>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleLogout}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'flex w-full px-4 py-2 text-sm text-gray-700 items-center'
                )}
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
