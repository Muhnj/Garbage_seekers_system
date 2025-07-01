'use client'
import React from 'react'
import { useRouter } from 'next/navigation';


export default function LoginBtn({children, model="redirect", asChild}) {
    const router = useRouter()
    
    const onClick = () => {
        router.push('/login');
    }

    if(model == "model"){
        return(
            <span>Model in action</span>
        )
    }

  return (
    <span className="cursor-pointer" onClick={onClick}>{children}</span>
  )
}
