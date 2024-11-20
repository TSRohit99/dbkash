'use server'

import { cookies } from "next/headers";

export async function flushCookie() {
    (await cookies()).delete('jwt');
}