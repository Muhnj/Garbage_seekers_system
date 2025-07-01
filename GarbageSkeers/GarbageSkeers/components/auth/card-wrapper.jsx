'use client'

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Header } from "./header"

export function CardWrapper({children, headerLabel, backButtonLabel, backButtonHref, showSocial}) {
  return (
    <Card className="w-[400px] shadow-md">
        <CardHeader>
            <Header label={headerLabel}/>
        </CardHeader>
        {children}
    </Card>
  )
}
