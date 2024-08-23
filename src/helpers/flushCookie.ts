'use server'

import { cookies } from "next/headers";

export async function flushCookie() {
    cookies().delete('jwt');
}