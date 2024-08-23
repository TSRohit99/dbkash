import { createResponse } from "@/helpers/CreateResponse";
import { ethers } from "ethers";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: Request): Promise<Response> {
    const req = await request.json();
    const { signature , address } = req;
    
    if (!address || !address ) {
        return createResponse({
            success: false,
            message: "No user address/signature provided"
        }, 400);
    }

    try {
        const extractedAddress = ethers.utils.verifyMessage("Hello Anon! Welcoming you to dBKash.", signature).toLowerCase();
        
        if(extractedAddress === address){

            const token = jwt.sign({
                address,
            }, process.env.JWT_SECRET, { expiresIn: '1d' });
            console.log(token)

            cookies().set('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 86400, // 1 day in seconds
                path: '/',
            });

            return createResponse({
                success: true,
                message: "Authentication Successfull!",
                authToken: token,
            }, 200);
        } else{
            return createResponse({
                success: false,
                message: "Invalid entry!"
            }, 403);
        }
        
    } catch (error) {
        console.error('Error while authenticating:', error);
        return createResponse({
            success: false,
            message: "Internal server error",
        }, 500);
    }
}
