'use client'
import MobileNavBar from '@/components/dashboard/modileNav'
import NavBar from '@/components/dashboard/navbar'
import SideBar from '@/components/dashboard/navigation'
import React, { useEffect } from 'react'
import ProtectedRoute from '@/components/HOC/protectedRoute'
import useAutoLogout from '@/hooks/autoActions'
import { useAuthStore } from '@/store/useAuthStore' // Import the auth store

export default function DashboardLayout({ children }) {
  useAutoLogout();

  useEffect(() => {
    useAuthStore.getState().initAuthListener();
  }, []);

  return (
      <div className='h-screen flex overflow-hidden '>
        <SideBar/>
        <MobileNavBar/>
        <div className='w-full overflow-y-auto hide-scrollbar'>
          <NavBar/>
          <div className='px-2 md:px-8 py-16 w-full col-span-10'>
            {children}
          </div>
        </div>
      </div>
  )
}
