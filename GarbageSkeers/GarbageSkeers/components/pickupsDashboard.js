'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import useModalStore from '@/store/modalStore';
import {useFilterStore} from '@/store/filterStore';
import { Filter, Plus, Shield, Crosshair, CheckCircle, XCircle } from 'lucide-react';
import { db } from '@/libs/firebase'; // Import Firestore instance
import { collection, onSnapshot } from 'firebase/firestore'; // Import Firestore methods
import MessageCard from '@/components/dashboard/message-card';
import RecentMessages from '@/components/dashboard/messages-panel';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function PickupsDashboard() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openModal } = useModalStore();
  const pathname = usePathname();
  const { setPickupFilter } = useFilterStore();

  useEffect(() => {
    // Real-time listener for Firestore collection
    const unsubscribe = onSnapshot(
      collection(db, 'pickups'), // Replace 'pickups' with your Firestore collection name
      (snapshot) => {
        const pickupsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPickups(pickupsData);
        setLoading(false);
      },
      (error) => {
        console.error('Failed to fetch pickups in real-time:', error);
        setLoading(false);
      }
    );

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  // Calculate metrics
  const totalPickups = pickups.length;
  const assignedPickups = pickups.filter(w => w.status === 'pending').length;
  const availablePickups = pickups.filter(w => w.status === 'completed').length;
  const cancelledPickups = pickups.filter(w => w.status === 'cancelled').length;
  
  // Group by pickup type
  const typeCounts = pickups.reduce((acc, pickup) => {
    acc[pickup.garbageType] = (acc[pickup.garbageType] || 0) + 1;
    return acc;
  }, {});

  // Chart data
  const statusChartData = {
    labels: ['Pending', 'Completed', 'Cancelled'],
    datasets: [
      {
        label: 'Pickups by Status',
        data: [assignedPickups, availablePickups, cancelledPickups],
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)',  // Pending (indigo)
          'rgba(16, 185, 129, 0.7)', // Completed (emerald)
          'rgba(245, 158, 11, 0.7)'  // Cancelled (amber)
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const typeChartData = {
    labels: Object.keys(typeCounts),
    datasets: [
      {
        label: 'Pickups by Garbage Type',
        data: Object.values(typeCounts),
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(244, 63, 94, 0.7)',
          'rgba(234, 88, 12, 0.7)',
          'rgba(22, 163, 74, 0.7)',
          'rgba(220, 38, 38, 0.7)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(244, 63, 94, 1)',
          'rgba(234, 88, 12, 1)',
          'rgba(22, 163, 74, 1)',
          'rgba(220, 38, 38, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <Link href="/dashboard/pickups/" onClick={() => setPickupFilter('All')} className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Pickups</p>
              <h3 className="text-2xl font-bold mt-1">{totalPickups}</h3>
            </div>
            <div className="p-3 rounded-full bg-emerald-50 text-indigo-600">
              <Shield className="w-6 h-6" />
            </div>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <Link href="/dashboard/pickups/" onClick={() => setPickupFilter('Pending')} className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending</p>
              <h3 className="text-2xl font-bold mt-1">{assignedPickups}</h3>
            </div>
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <Crosshair className="w-6 h-6" />
            </div>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <Link href="/dashboard/pickups/" onClick={() => setPickupFilter('Completed')} className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Completed</p>
              <h3 className="text-2xl font-bold mt-1">{availablePickups}</h3>
            </div>
            <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <Link href="/dashboard/pickups/" onClick={() => setPickupFilter('Canceled')} className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Cancelled</p>
              <h3 className="text-2xl font-bold mt-1">{cancelledPickups}</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
              <XCircle className="w-6 h-6" />
            </div>
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h4 className="text-lg font-semibold mb-4">Pickups by Status</h4>
          <div className="h-64">
            <Pie 
              data={statusChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h4 className="text-lg font-semibold mb-4">Pickups by Type</h4>
          <div className="h-64">
            <Bar
              data={typeChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity or Additional Metrics */}
      <div className='grid grid-cols-2 gap-4 mt-4'>
        <div className="col-span-1 bg-white p-6 rounded-lg shadow border border-gray-100">
          <h4 className="text-lg font-semibold mb-4">Recent Activity</h4>
          <div className="space-y-4">
            {pickups.slice(0, 5).map((pickup, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                <div>
                  <p className="font-medium">{pickup.collectorName}</p>
                  <p className="text-gray-500 text-xs">{pickup.garbageType.toUpperCase()} Waste | {pickup.id}</p>
                  <p className="text-gray-500 text-xs">Sacks: {pickup.sackCount}| UGX. {pickup.totalPrice}</p>
                  <p className="text-gray-400 text-xs">
                    {formatDistanceToNow(new Date(pickup.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  pickup.status === 'Pending' ? 'bg-emerald-100 text-indigo-800' :
                  pickup.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {pickup.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <RecentMessages />
      </div>
    
    </div>
  );
}