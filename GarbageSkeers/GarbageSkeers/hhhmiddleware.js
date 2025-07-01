// // middleware.js
// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import { verifyToken } from './libs/auth';


// export async function middleware(req) {
  
    
//     const cookieStore = await cookies();
//     const token = cookieStore.get('token')?.value
//     console.log(token);

//   const { pathname } = req.nextUrl;

//   // Allow access to the root path
//   if (pathname === '/') {
//     return NextResponse.next();
//   }

//   // Check for token presence
//   if (!token) {
//     return NextResponse.redirect(new URL('/auth/signin', req.url));
//   }else{
//     if(pathname === '/auth/signin'){
//         return NextResponse.redirect(new URL('/dashboard', req.url)); 
//     }
//   }

//   try {
//     // Verify the token
//     verifyToken(token);
//     return NextResponse.next();
//   } catch (error) {
//     console.log(error);
//     return NextResponse.redirect(new URL('/auth/signin', req.url));
//   }
// }

// export const config = {
//   matcher: ['/protected-route/:path*', '/admin/:path*'], // Specify protected routes
// };