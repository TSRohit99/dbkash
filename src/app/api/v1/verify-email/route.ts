// pages/api/verify-email.ts

import dbConnect from "@/lib/db/dbConnect";
import userModel from "../../../../models/user";
import { createResponse } from "@/helpers/CreateResponse";
import bcrypt from 'bcrypt'
import { headers } from "next/headers";

export async function POST(request: Request): Promise<Response> {
    const req = await request.json();
    const {verificationCode } = req;
    const address = (await headers()).get("x-user-address");
        
    try {
        await dbConnect();
        const user = await userModel.findOne({ address: address });
        
        if (!user) {
            return createResponse({
                success: false,
                message: "User not found"
            }, 404);
        }

        if (!user.verificationCode || !user.pendingEmail) {
            return createResponse({
                success: false,
                message: "No pending email verification"
            }, 400);
        }

        if (user.verificationCodeExpires < Date.now()) {
            return createResponse({
                success: false,
                message: "Verification code has expired"
            }, 400);
        }

        const isValid = await bcrypt.compare(verificationCode, user.verificationCode);

        if (isValid) {
            // Update the user's email and clear verification data
            await userModel.findOneAndUpdate(
                { address: address },
                {
                    $set: { email: user.pendingEmail },
                    $unset: { pendingEmail: "", verificationCode: "", verificationCodeExpires: "" }
                }
            );

            return createResponse({
                success: true,
                message: "Email verified successfully"
            }, 200);
        } else {
            return createResponse({
                success: false,
                message: "Invalid verification code"
            }, 400);
        }
    } catch (error) {
        console.error('Error verifying email code:', error);
        return createResponse({
            success: false,
            message: "Internal server error"
        }, 500);
    }
}