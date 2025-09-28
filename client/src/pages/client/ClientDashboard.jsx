import React from 'react';
import { Mail, FileText, User } from 'lucide-react';

const ClientDashboard = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your personal dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mail Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <Mail className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          </div>
          <p className="text-gray-600 mb-4">
            View and manage your messages and communications with our team.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">New messages</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">3</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Total messages</span>
              <span className="text-sm text-gray-600">12</span>
            </div>
          </div>
        </div>

        {/* Suivi (Tracking) Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <FileText className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Suivi</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Track the progress of your applications and services.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Active applications</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">2</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Completed</span>
              <span className="text-sm text-gray-600">5</span>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <User className="h-8 w-8 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Manage your personal information and account settings.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Account status</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Last updated</span>
              <span className="text-sm text-gray-600">Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-700">New message received from support team</span>
            <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-700">Application status updated to "In Review"</span>
            <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-700">Profile information updated</span>
            <span className="text-xs text-gray-500 ml-auto">3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
