import React from 'react';

export default function HelpPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="mt-2 text-gray-600">
          Get help with creating and sharing your maps.
        </p>
      </div>

      {/* FAQ Section */}
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-2">How do I create a new map?</h3>
              <p className="text-gray-600">
                Go to "My Maps" and click the "Create New Map" button. You can then add markers, draw shapes, and customize your map.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-2">How do I share a map?</h3>
              <p className="text-gray-600">
                In the map editor, click the share button. You can create a public link or protect it with a password.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-2">Can I organize my markers?</h3>
              <p className="text-gray-600">
                Yes! You can create custom categories for your markers with different colors and icons.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-2">How do I add images to markers?</h3>
              <p className="text-gray-600">
                When editing a marker, you can upload images that will be displayed in the marker popup.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Need More Help?</h2>
          <div className="bg-blue-50 rounded-lg p-6">
            <p className="text-blue-900">
              If you can't find what you're looking for in our FAQ, feel free to reach out for support.
            </p>
            <button className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
              Contact Support
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
