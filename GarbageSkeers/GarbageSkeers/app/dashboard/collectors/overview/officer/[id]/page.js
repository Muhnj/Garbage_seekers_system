'use client';
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/libs/firebase';
import { useParams } from 'next/navigation';
import { User, Shield, Phone, Mail, FileText, MapPin, Clock, Crosshair, Calendar, Edit } from 'lucide-react';
import Image from 'next/image';
import StatusBadge from '@/components/status-badge';
import OfficerDocuments from '@/components/collector-documents';
import OfficerActivity from '@/components/collector-activity';
import useModalStore from '@/store/modalStore';
import UpdateCollectorModal from '@/components/Data Models/updateOfficer';

export default function OfficerProfile() {
  const { id } = useParams();
  const { openModal } = useModalStore();
  const [collector, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Default values
  const DEFAULT_AVATAR = '/default-avatar.jpg';
  const DEFAULT_VALUES = {
    firstName: 'Unknown',
    lastName: 'Officer',
    email: 'Not provided',
    phone: 'Not provided',
    nin: 'Not provided',
    gender: 'Not specified',
    department: 'Not assigned',
    collectorNumber: 'N/A',
    maritalStatus: 'Not specified',
    age: 'N/A',
    position: 'Security Officer',
    photoURL: DEFAULT_AVATAR,
    nationalIdURL: '',
    documentsURLs: [],
    status: 'off-duty',
    assignments: [],
    location: null,
    createdAt: null
  };

  // Safe data handling
  const safeData = (data) => {
    return {
      ...DEFAULT_VALUES,
      ...data,
      photoURL: data?.photoURL?.trim() || DEFAULT_AVATAR,
      firstName: data?.firstName?.trim() || DEFAULT_VALUES.firstName,
      lastName: data?.lastName?.trim() || DEFAULT_VALUES.lastName
    };
  };

  useEffect(() => {
    const fetchOfficer = async () => {
      try {
        if (!id) {
          throw new Error('No collector ID provided');
        }

        const docRef = doc(db, 'collectors', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOfficer({
            id: docSnap.id,
            ...safeData(data),
            createdAt: data.createdAt || null,
            location: data.location || null
          });
        } else {
          setError(`Officer with ID ${id} not found`);
        }
      } catch (error) {
        console.error('Error fetching collector:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficer();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const collectorRef = doc(db, 'collectors', id);
      await updateDoc(collectorRef, { status: newStatus });
      setOfficer(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  const handleEdit = () => {
    if (collector) {
      openModal(<UpdateCollectorModal collector={collector} />);
    }
  };

  const formatDate = (timestamp) => {
    try {
      return timestamp?.toDate().toLocaleDateString() || 'N/A';
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg font-medium">Error: {error}</p>
          {id && <p className="mt-2 text-gray-600">Officer ID: {id}</p>}
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-main text-white rounded hover:bg-emerald-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!collector) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium">Officer not found</p>
          {id && <p className="mt-2 text-gray-600">Officer ID: {id}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full border-4 border-white shadow-md">
            <Image
              src={collector.photoURL}
              alt={`${collector.firstName} ${collector.lastName}`}
              fill
              className="object-cover rounded-full"
              priority
              onError={(e) => {
                e.currentTarget.src = DEFAULT_AVATAR;
                e.currentTarget.onerror = null;
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {collector.firstName} {collector.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={collector.status} />
              <span className="text-sm text-gray-500">#{collector.collectorNumber}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-main text-main rounded-lg hover:bg-main hover:text-white transition-colors"
          >
            <Edit size={16} />
            Edit Profile
          </button>
          
          <div className="flex items-center gap-2">
            <select
              value={collector.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-main focus:border-main"
            >
              <option value="on-duty">On Duty</option>
              <option value="off-duty">Off Duty</option>
              <option value="on-leave">On Leave</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-main text-main' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'documents' ? 'border-main text-main' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'activity' ? 'border-main text-main' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Activity
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="text-main" size={18} />
              Personal Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{collector.firstName} {collector.lastName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium capitalize">{collector.gender}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{collector.age}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Marital Status</p>
                <p className="font-medium capitalize">{collector.maritalStatus}</p>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="text-main" size={18} />
              Contact Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="text-gray-400" size={16} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{collector.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" size={16} />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{collector.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FileText className="text-gray-400" size={16} />
                <div>
                  <p className="text-sm text-gray-500">NIN</p>
                  <p className="font-medium">{collector.nin}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <>
              {/* Employment Card */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="text-main" size={18} />
                  Employment Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Officer Number</p>
                    <p className="font-medium">#{collector.collectorNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{collector.department}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="font-medium capitalize">{collector.position}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Date Joined</p>
                    <p className="font-medium">{formatDate(collector.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="text-main" size={18} />
                  Current Location
                </h2>
                
                {collector.location?.lat ? (
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    {/* Map integration would go here */}
                    <p className="text-gray-500">Map view would be displayed here</p>
                  </div>
                ) : (
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Location data not available</p>
                  </div>
                )}
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                  <button className="text-sm text-main hover:underline">
                    View Location History
                  </button>
                </div>
              </div>

              {/* Recent Assignments */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Crosshair className="text-main" size={18} />
                  Recent Assignments
                </h2>
                
                <div className="space-y-4">
                  {collector.assignments.length > 0 ? (
                    collector.assignments.slice(0, 3).map((assignment, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{assignment.site || 'Unknown site'}</h3>
                            <p className="text-sm text-gray-500">{assignment.type || 'General duty'}</p>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{assignment.date || 'No date specified'}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{assignment.notes || 'No additional notes'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No recent assignments</p>
                  )}
                </div>
                
                <button className="mt-4 text-sm text-main hover:underline">
                  View All Assignments
                </button>
              </div>
            </>
          )}

          {activeTab === 'documents' && (
            <OfficerDocuments 
              documents={collector.documentsURLs} 
              nationalId={collector.nationalIdURL} 
            />
          )}

          {activeTab === 'activity' && (
            <OfficerActivity collectorId={collector.id} />
          )}
        </div>
      </div>
    </div>
  );
}