'use client';
import React from 'react';
import { Clock, MapPin, Shield, CheckCircle } from 'lucide-react';

const OfficerActivity = ({ collectorId }) => {
  // In a real app, you would fetch activity data based on collectorId
  const activityItems = [
    {
      id: 1,
      type: 'check-in',
      location: 'Headquarters',
      time: '2 hours ago',
      details: 'Started morning shift'
    },
    {
      id: 2,
      type: 'assignment',
      location: 'City Mall',
      time: '1 day ago',
      details: 'Assigned to patrol duty'
    },
    {
      id: 3,
      type: 'training',
      location: 'Training Center',
      time: '3 days ago',
      details: 'Completed firearms requalification'
    },
    {
      id: 4,
      type: 'check-out',
      location: 'Headquarters',
      time: '1 week ago',
      details: 'Ended evening shift'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'check-in':
      case 'check-out':
        return <Clock className="text-emerald-500" size={16} />;
      case 'assignment':
        return <MapPin className="text-green-500" size={16} />;
      case 'training':
        return <Shield className="text-purple-500" size={16} />;
      default:
        return <CheckCircle className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
      
      <div className="space-y-4">
        {activityItems.map((item) => (
          <div key={item.id} className="border-l-2 border-main pl-4 py-2">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {getActivityIcon(item.type)}
              </div>
              <div>
                <h3 className="font-medium capitalize">{item.type.replace('-', ' ')}</h3>
                <p className="text-sm text-gray-600">{item.details}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{item.location}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfficerActivity;