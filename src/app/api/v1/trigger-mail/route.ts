import dbConnect from "@/lib/db/dbConnect";
import userModel from "../../../../models/user";
import { createResponse } from "@/helpers/CreateResponse";
import { sendVerificationEmail } from "@/helpers/sendVerificationEMail";
import bcrypt from 'bcrypt'
import { headers } from "next/headers";
import { sendNMVerificationEmail } from "@/helpers/sendNMVerification";

export async function POST(request: Request): Promise<Response> {
    const req = await request.json();
    const {email, name } = req;
    const address = (await headers()).get("x-user-address");
    
    try {
        await dbConnect();

        if (await userModel.findOne({email})) {
            return createResponse({
                success: false,
                message: "This email is already registered!"
            }, 400);
        }

        console.log("Connected to database, attempting to verify email...");
        const verifyCode = Math.floor(1000 + Math.random() * 9000).toString();
        const hashedVerifyCode = await bcrypt.hash(verifyCode, 10);
        
        // Send verification email
        const emailResponse = await sendNMVerificationEmail(name , email, verifyCode); //NodeMailer
        // const emailResponse = await sendVerificationEmail(name , email, verifyCode); //Resend email
        if(!emailResponse.success){
            return createResponse({
                success: false,
                message: emailResponse.message
            }, 500);
        }

        // Store the hashed code and email temporarily
        await userModel.findOneAndUpdate(
            { address },
            {
                $set: {
                    pendingEmail: email,
                    verificationCode: hashedVerifyCode,
                    verificationCodeExpires: Date.now() + 3600000 // 1 hour expiration
                }
            },
            { new: true }
        );

        return createResponse({
            success: true,
            message: "Verification email sent successfully! Check your email.",
        }, 201);
   
    } catch (error) {
        console.error('Error verifying email from api:', error);
        return createResponse({
            success: false,
            message: "Internal server error"
        }, 500);
    }
}