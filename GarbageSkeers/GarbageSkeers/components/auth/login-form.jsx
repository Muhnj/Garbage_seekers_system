import React from 'react'
import AuthProviderBtn from './authProviderButton'

export function LoginForm() {
  return (
    <div className='h-full w-full md:w-[500px] bg-white border-t-2 border-emerald-500 shadow'>
      {/* Form Heading */}
      <div className='p-4'>
        <p className='text-md text-main font-semibold'>Log into your SP Account</p>
      </div>
      <hr/>

      <div className='px-16 py-8 flex flex-col gap-8 text-sm'>
        {/* Disclaimer */}
        <p className='text-xs text-slate-500'>One Time Passcode will be sent to your Mobile Number not Email Address</p>
        {/* Form control */}
        <form className='flex flex-col gap-4 '>
          <label htmlFor="number">Mobile number please <span>*</span></label>
          <input type='text' placeholder='Enter mobile number here' className="px-4 py-4 text-center focus:outline-none border border-slate-300 rounded"></input>

          <button className='py-2 px-4 bg-main text-background rounded'>Login</button>
          <AuthProviderBtn />
        </form>

        <p className="text-center text-xs text-slate-500">Don't have an account? <a href='#' className='text-emerald-500 text-underline'>Become a member</a></p>

      </div>
    </div>
  )
}

export function OTPForm() {
  return (
    <div className='hidden h-full w-full md:w-[500px] bg-white border-t-2 border-emerald-500 shadow'>
      {/* Form Heading */}
      <div className='p-4'>
        <p className='text-md text-main font-semibold'>OTP sent to your phone</p>
      </div>
      <hr/>

      <div className='px-16 py-8 flex flex-col gap-8 text-sm'>
        {/* Disclaimer */}
        <p className='text-xs text-slate-500'>Check your phone SMS app for the OTP. Check before requesting another code</p>
        {/* Form control */}
        <form className='flex flex-col gap-4 '>
          <label htmlFor="number">Enter 6 digit code<span className='text-red-500'>*</span></label>
          <div className='w-full flex justify-between gap-2 text-xl'>
            <input type='text' placeholder="Enter code here" maxlenght={6} required className="size-14 px-2 py-2 text-center w-full focus:outline-green-400 border border-slate-300 rounded"></input>
          </div>

          <button className='py-3 px-4 bg-main text-background rounded'>Verify code</button>
          <p className="text-center text-xs text-slate-500">Didn't receive code? <a href='#' className='text-emerald-500 text-underline'>Resend code</a></p>
        </form>

        

      </div>
    </div>
  )
}
export function EmailForm() {
  return (
    <div className='h-full w-full md:w-[500px] bg-white border-t-2 border-emerald-500 shadow'>
      {/* Form Heading */}
      <div className='p-4'>
        <p className='text-md text-main font-semibold'>Log into your SP Account</p>
      </div>
      <hr/>

      <div className='px-16 py-8 flex flex-col gap-8 text-sm'>
        {/* Disclaimer */}
        <p className='text-xs text-slate-500'>One Time Passcode will be sent to your Mobile Number not Email Address</p>
        {/* Form control */}
        <form className='flex flex-col gap-4 '>
          <label htmlFor="number">Mobile number please <span>*</span></label>
          <input type='text' placeholder='e.g +256 712 345 678' className="px-4 py-2"></input>

          <button className='py-2 px-4 bg-main text-background rounded'>Login</button>
          <button className='py-2 px-4 outline-1 outline-dashed  text-main rounded'>Continue with Goggle</button>
        </form>

        <p className="text-center text-xs text-slate-500">Don't have an account? <a href='#' className='text-emerald-500 text-underline'>Become a member</a></p>

      </div>
    </div>
  )
}
