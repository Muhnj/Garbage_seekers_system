import { LoginWithEmail } from '@/utils/authService';
import { generateToken } from '@/libs/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
  const { email, password } = await req.json(); // Use req.json() to parse the body

  try {
    const user = await LoginWithEmail(email, password);

    const token = generateToken({ uid: user.uid, email: user.email });

    // Set the cookie using the cookies utility from next/headers
    const cookieStore = cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'strict',
      path: '/',
    });

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}