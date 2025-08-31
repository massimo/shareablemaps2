import React from 'react';

export default function SharedWithMePage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shared with me</h1>
        <p className="mt-2 text-gray-600">
          Maps that others have shared with you.
        </p>
      </div>

      {/* Empty State */}
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No shared maps</h3>
        <p className="mt-1 text-sm text-gray-500">
          When someone shares a map with you, it will appear here.
        </p>
      </div>
    </div>
  );
}
