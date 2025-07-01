"use client";

import { Footprints, LucideLogIn, ShieldAlert, UserPlus, Book, Locate } from 'lucide-react'
import React from 'react'
import { motion } from 'framer-motion';

const floatTransition = {
  y: {
    duration: 3,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut"
  }
};

export default function LoadingPage() {
  return (
    <div className='min-h-fit w-full'>
      <div className='grid grid-cols-8 gap-8'>
        {/* Security Plan Card */}
        <div className='flex gap-12 flex-col col-span-8 lg:col-span-4 w-full min-h-fit bg-gradient-to-br from-main to-emerald-500 rounded-lg p-16'>
          <div className='flex gap-12'>
            <div className='text-gray-100'>
              <p className='text-lg text-gray-400 font-light'>What your facing!</p>
              <p className='text-3xl font-semibold my-4 '>Problem</p>
              <p className='text-gray-400'>Over 60% percent of the security companys in uganda relay on manual processes during Deployment leading to delayed response time, poor coordination, and limited real-time visibility of guards due to indequate use of modern ICT tool</p>
            </div>
            <motion.span
              className='h-full'
              animate={{ y: [0, 10, 0] }}
              transition={floatTransition}
            >
              <ShieldAlert className='size-24 text-background'/>
            </motion.span>
          </div>
          <div className='w-full flex gap-4 md'>
            <button className='py-4 px-4 bg-sub text-gray-200 md:w-1/2 w-full rounded-md flex items-center justify-center gap-2 '>
              <LucideLogIn className='size-4'/>
              <a href="/auth/signin">Log into your account</a>
            </button>
            <button className='py-4 px-4 bg-main text-gray-200 md:w-1/2 w-full rounded-md flex items-center justify-center gap-2 '>
              <UserPlus className='size-4'/>
              <a href="/auth/signin">Register Security Company</a>
            </button>
          </div>
        </div>

        {/* Monitored Deployment Card */}
        <div className='flex gap-12 flex-col col-span-8 lg:col-span-4 w-full h-fit bg-gradient-to-br from-emerald-500 to-main rounded-lg p-16'>
          <div className='flex gap-12'>
            <div className='text-gray-100'>
              <p className='text-lg text-gray-400 font-light'>Tracked and Monitored!</p>
              <p className='text-3xl font-semibold my-4 '>GPS Enabled</p>
              <p className='text-gray-400'>Our solution offers automated deployment and real-time monitoring, giving you complete visibility into your security personnel during deployments. Track shifts, movements, and assignments instantly from one dashboard. Improve response times, ensure accountability, and make faster decisions. Stay informed and in control with live updates that strengthen your overall security operations.</p>
            </div>
            <motion.span
              className='h-full'
              animate={{ y: [0, 10, 0] }}
              transition={floatTransition}
            >
              <Footprints className='size-24 text-background'/>
            </motion.span>
          </div>
          <div className='w-full flex gap-4'>
            <button className='py-4 px-4 bg-sub text-gray-200 md:w-1/2 w-full rounded-md flex items-center justify-center gap-2 '>
              <Locate className='size-4'/>Track my collectors
            </button>
          </div>
        </div>
        
        {/* Manuals Card */}
        <div className='flex justify-center items-center gap-16 col-span-8 w-full min-h-fit bg-gradient-to-br from-main to-emerald-500 rounded-lg p-8'>
          <div className='text-gray-100'>
            <p className='text-lg text-gray-400 font-light'>How to get the solution!</p>
            <p className='text-3xl font-semibold my-4 '>As low as UGX 100,000  (25 Security Guides below) </p>
            <p className='text-gray-400'>Managing 25 security below will take you as low UGX 100,000.</p>
          </div>
          <motion.button
            className='py-4 px-4 h-16 w-48 bg-main text-gray-200 md:w-1/2 rounded-md flex items-center justify-center gap-2'
            animate={{ y: [0, 10, 0] }}
            transition={floatTransition}
          >
            <Book className='inline'/> Read our Terms and Conditions
          </motion.button>
        </div>
        <div className='flex justify-center items-center gap-16 col-span-8 w-full min-h-fit bg-gradient-to-br from-main to-emerald-500 rounded-lg p-8'>
          <div className='text-gray-100'>
            <p className='text-lg text-gray-400 font-light'>How to get the solution!</p>
            <p className='text-3xl font-semibold my-4 '>As low as UGX 150,000  ( 25 - 50 Security Guards) </p>
            <p className='text-gray-400'>An increament of 25 security guards results to addition UGX 50000</p>
          </div>
          <motion.button
            className='py-4 px-4 h-16 w-48 bg-main text-gray-200 md:w-1/2 rounded-md flex items-center justify-center gap-2'
            animate={{ y: [0, 10, 0] }}
            transition={floatTransition}
          >
            <Book className='inline'/> Read our Terms and Conditions
          </motion.button>
        </div>
      </div>
    </div>
  )
}