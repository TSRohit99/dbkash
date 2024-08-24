// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {

  if (request.nextUrl.pathname.startsWith('/api/v1')) {
    const token = request.cookies.get('jwt')?.value;

    if (!token) {
      console.warn('No JWT token found in cookies');
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication required!' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET as string));
      const address = (payload as { address: string }).address;
      if (!address) {
        console.error('Address not found in decoded JWT');
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Invalid token structure!' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-address', address);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Error verifying JWT:', error);
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Invalid token!' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}


export const config = {
  matcher: '/api/v1/:path((?!user-auth).*)',
};