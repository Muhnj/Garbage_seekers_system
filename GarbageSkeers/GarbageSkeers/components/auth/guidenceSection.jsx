import { ShieldCheck, ShieldQuestion, ShieldUser } from 'lucide-react'
import React from 'react'


export default function GuidenceSection() {
  return (
    <div className='text-white flex flex-col h-full w-full mt-8 gap-8 items-center'>
        {/* Logo */}
        <span className='font-bold'>
            <ShieldCheck className='size-12'/>
        </span>

        {/* Headline */}
        <div className='flex flex-col gap-8'>
            <h1 className='text-center text-4xl font-semibold'>Log into your <br/>SP account</h1>
            <h2 className='text-center text-md font-light text-slate-300'>Have your phone and email ready a quick login</h2>
        </div>
        
        {/* rule tags */}
        <div className="w-full flex flex-col gap-6 pl-8 relative z-10">
            <span className='block w-1/2 h-full border-l-2 border-slate-300 border-dashed absolute -z-10 left-14'></span>
            <RuleTag title={'Enter valid phone number'} subtitle={'Start with country code'} number={1}/>
            <RuleTag title={'Enter OTP code'} subtitle={'OTP sent via SMS'} number={2}/>
            <RuleTag title={'Get access to the Dashboard'} subtitle={'Monitor your account'} number={3}/>
        </div>
    </div>
  )
}

function RuleTag({number, title, subtitle}){
    return(
        <div className="flex gap-4 items-center">
            <span className='bg-background size-12 flex justify-center items-center text-emerald-500 rounded '>
                <p className='text-lg'>{number}</p>
            </span>
            <div className='flex flex-col gap-0'>
                <p className='text-sm'>{title}</p>
                <p className='text-sm text-slate-300 font-light'>{subtitle}</p>
            </div>
        </div>
    )
}
