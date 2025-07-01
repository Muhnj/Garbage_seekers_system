import React from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/HOC/protectedRoute'



export default function HomePage() {
  return (
    <ProtectedRoute roleRequired={"user"}>
        <div className='overflow-hidden'>
          <Link href={""}>Admins only</Link>
        </div>
    </ProtectedRoute>
  )
}
