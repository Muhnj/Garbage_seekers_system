import React from 'react'
import GuidenceSection from './guidenceSection'
import { LoginForm, OTPForm } from './login-form'

export default function AuthPage() {
  return (
    <div className='grid grid-cols-12 w-screen min-h-[100vh]'>
      {/* Guidence section */}
      <div className='col-span-4 bg-main p-16'>
        <GuidenceSection />
      </div>
      {/* End of Guidence Section */}

      {/* Auth Component Container */}
      <div className='col-span-8 bg-background flex w-full justify-center p-16'>
        <OTPForm/>
        <LoginForm/> 
      </div>
      {/* End of container */}
    </div>
  )
}
