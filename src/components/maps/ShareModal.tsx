'use client';

import React, { useState } from 'react';
import { 
  XMarkIcon,
  ShareIcon,
  LockClosedIcon,
  EyeIcon,
  KeyIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapId: string;
  mapTitle: string;
  onSave: (shareSettings: ShareSettings) => void;
}

export interface ShareSettings {
  shareType: 'private' | 'public' | 'password';
  password?: string;
  isEnabled: boolean;
}

export default function ShareModal({ isOpen, onClose, mapId, mapTitle, onSave }: ShareModalProps) {
  const [shareType, setShareType] = useState<'private' | 'public' | 'password'>('private');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const getShareUrl = () => {
    return `${window.location.origin}/shared/${mapId}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      // You could add a toast notification here
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = getShareUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settings: ShareSettings = {
        shareType,
        password: shareType === 'password' ? password : undefined,
        isEnabled: shareType !== 'private'
      };

      await onSave(settings);
      onClose();
    } catch (error) {
      console.error('Error saving share settings:', error);
      alert('Failed to save share settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isPasswordValid = shareType !== 'password' || (password.trim().length >= 4);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ShareIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Share Map</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{mapTitle}</h4>
            <p className="text-sm text-gray-600">
              Choose how you want to share this map with others.
            </p>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            {/* Private */}
            <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
              <input
                type="radio"
                name="shareType"
                value="private"
                checked={shareType === 'private'}
                onChange={(e) => setShareType(e.target.value as 'private')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <LockClosedIcon className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Private (Only me)</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Only you can view and edit this map
                </p>
              </div>
            </label>

            {/* Public */}
            <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
              <input
                type="radio"
                name="shareType"
                value="public"
                checked={shareType === 'public'}
                onChange={(e) => setShareType(e.target.value as 'public')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <EyeIcon className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-gray-900">Anyone with the link</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Anyone with the link can view this map (read-only)
                </p>
              </div>
            </label>

            {/* Password Protected */}
            <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
              <input
                type="radio"
                name="shareType"
                value="password"
                checked={shareType === 'password'}
                onChange={(e) => setShareType(e.target.value as 'password')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <KeyIcon className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-gray-900">Anyone with the link and password</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Viewers need the link and password to access this map
                </p>
              </div>
            </label>
          </div>

          {/* Password Input */}
          {shareType === 'password' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Set Password (minimum 4 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              </div>
              {password.length > 0 && password.length < 4 && (
                <p className="text-xs text-red-600">Password must be at least 4 characters long</p>
              )}
            </div>
          )}

          {/* Share URL Preview */}
          {shareType !== 'private' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Share URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={getShareUrl()}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600"
                />
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  title="Copy to clipboard"
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isPasswordValid || isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
