'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/libs/firebase';
import Image from 'next/image';
import { collectorManager } from '@/libs/resourceManagement';
import { Mail, Phone } from 'lucide-react';

export default function CollectorDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [collector, setCollector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const fetchCollector = async () => {
      if (!id) return;

      try {
        
        const collectorInfo = await collectorManager.get(id);

        if (collectorInfo) {
          setCollector(collectorInfo);
        } else {
          alert('Collector not found');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching collector:', error);
        alert('Failed to load collector details');
      } finally {
        setLoading(false);
      }
    };

    fetchCollector();
  }, [id]);

  const handleApproveCollector = async () => {
    setApproving(true);
    try {
      await collectorManager.updateResource(id, {
        status: 'verified',
        verifiedAt: new Date().toISOString(),
      });

      alert('Collector has been approved');
      setCollector((prev) => ({ ...prev, status: 'verified' }));
    } catch (error) {
      console.error('Error approving collector:', error);
      alert('Failed to approve collector');
    } finally {
      setApproving(false);
    }
  };

  if (loading || !collector) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 mx-auto py-8 px-4 gap-4 border-t-2 border-gray-200">
      {/* Profile Section */}
      <div className=" col-span-4 bg-white rounded-lg shadow-md p-6 mb-6 flex flex-col gap-4">
        <div className="flex items-start mb-4">
          <div className='w-12 h-12 object-contain rounded-full overflow-hidden mr-4 bg-red-400 flex items-center justify-center'>
              <Image
                src={collector.collectorPhoto}
                alt="Collector Photo"
                width={280}
                height={280}
              />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {collector.firstName} {collector.lastName}
            </h1>
            <p className="text-gray-600 text-sm flex items-center gap-4"><Phone size={12}/> {collector.phone}</p>
            <p className="text-gray-600 text-sm flex items-center gap-4"><Mail size={12}/> {collector.email}</p>
            <span
          className={`px-2 py-1 text-sm font-medium ${
            collector.status === 'verified'
              ? 'bg-green-100 text-green-800'
              : 'bg-orange-100 text-orange-800'
          }`}
        >
          {collector.status === 'verified' ? 'Verified' : 'Pending Approval'}
        </span>
          </div>
        </div>
        
        {/* Admin Approval Section */}
      {collector.status !== 'verified' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-3">Admin Actions</h2>
          <button
            onClick={handleApproveCollector}
            disabled={approving}
            className={`w-full py-3 rounded-lg text-white font-bold ${
              approving ? 'bg-emerald-300 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {approving ? 'Approving...' : 'Approve Collector'}
          </button>
        </div>
      )}
      </div>

      {/* Documents Section */}
      <div className="col-span-4 bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Documents</h2>

        <p className="font-medium mb-1">NIN: {collector.nin}</p>

        <div className="mb-4">
          <p className="font-medium mb-1">LC1 Letter:</p>
          <Image
            src={collector.lc1LetterPhoto}
            alt="LC1 Letter"
            width={600}
            height={200}
            className="rounded object-cover w-full h-auto"
          />
        </div>

        <div className="mb-4">
          <p className="font-medium mb-1">Equipment Type: {collector.equipmentType}</p>
          <Image
            src={collector.equipmentPhoto}
            alt="Equipment"
            width={600}
            height={200}
            className="rounded object-cover w-full h-auto"
          />
        </div>

        {collector.hasCompany && collector.companyName && collector.companyRegPhoto && (
          <div>
            <p className="font-medium mb-1">Company: {collector.companyName}</p>
            <p className="font-medium mb-1">Registration:</p>
            <Image
              src={collector.companyRegPhoto}
              alt="Company Registration"
              width={600}
              height={200}
              className="rounded object-cover w-full h-auto"
            />
          </div>
        )}
      </div>

      {/* Pricing Section */}
      <div className="col-span-4 bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-bold mb-2">Pricing</h2>
        <p className="text-gray-700">
          Price per sack: UGX {collector.pricePerSack?.toLocaleString()}
        </p>
      </div>

      
    </div>
  );
}
