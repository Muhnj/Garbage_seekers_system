//Rate out of 10

import { NextResponse } from "next/server";

export function checkAuth(req, protectedRoutes = [], authRoutes = []){
    //Check for cookies 
    const token = req.cookies.get('token')?.value;

    //Get the requested url
    const url = req.nextUrl.pathname;

    if(!token && protectedRoutes.includes(url)){
        NextResponse.redirect(new URL('/login', req.url));
        console.log("Middleware on duty")
    }
    else if(token && authRoutes.includes(url)){
        NextResponse.redirect(new URL('/dashboard', req.url));
        console.log("Middleware on duty")
    }

    return NextResponse.next();
}