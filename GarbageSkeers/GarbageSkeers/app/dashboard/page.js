"use client"
import React, { useEffect } from 'react'
import CardGroup from '@/components/ud/cardGroup'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation'
import PickupsDashboard from '@/components/pickupsDashboard'



function Dashboard() {

  const {user} = useAuthStore();
  console.log(user)

  const router = useRouter();
  return (
    <div className="flex flex-col gap-8 ">
        <ToastContainer />
        <div className='flex flex-col'>
          <CardGroup/>
        </div>
        <PickupsDashboard />
    </div>
  )
}

export default Dashboard