import { useState } from 'react';
import { HiOutlineUserGroup, HiOutlineAcademicCap, HiOutlineChartBar } from 'react-icons/hi2';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">System Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-primary-50 text-primary-600 rounded-full">
              <HiOutlineUserGroup className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Total Students</p>
              <h3 className="text-2xl font-extrabold text-gray-900">1,248</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-full">
              <HiOutlineAcademicCap className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Instructors</p>
              <h3 className="text-2xl font-extrabold text-gray-900">42</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-green-50 text-green-600 rounded-full">
              <HiOutlineChartBar className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Avg Assessment Score</p>
              <h3 className="text-2xl font-extrabold text-gray-900">76%</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
             <h3 className="font-bold text-gray-900">Recent User Activity & Performance</h3>
          </div>
          <div className="p-12 text-center text-gray-500">
             A detailed monitoring view combining student scores and instructor publishing analytics will appear here. The backend aggregator is tracking records.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
