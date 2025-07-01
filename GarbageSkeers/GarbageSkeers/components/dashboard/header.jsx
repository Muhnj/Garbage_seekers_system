import { Ellipsis } from 'lucide-react'
import React from 'react'

export function Header({title, subtitle}) {
  return (
    <div className='flex flex-col gap-2 mb-4'>
        <span className='font-bold text-xl text-slate-900'>{title}</span>
        <span className='text-xs text-[#CCCCCC]'>{subtitle}</span>
    </div>
  )
}

export function CardHeader({title}){
  return(
    <div className='flex justify-between items-center'>
        <span className='font-semibold text-lg'>{title}</span>
        <Ellipsis className='text-slate-200'></Ellipsis>
    </div>
  )
}