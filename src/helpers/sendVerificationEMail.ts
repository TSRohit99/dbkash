import { resend } from "@/lib/resend";

import VerificationEmail from "../../emails/verificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail( 
    username: string,
    email: string,
    verifyCode : string,
):Promise<ApiResponse>{

    try {
        const res = await resend.emails.send({
            from: 'dBKash <onboarding@resend.dev>',
            to: email,
            subject: 'dBKash | Verification Code',
            react: VerificationEmail({username,otp : verifyCode})
          });

         //Free tire issue
         if(res.error?.name == 'validation_error'){
            return {
                success: false,
                message:"For free tier only owner can receive verification email!"
            }
         }

        return {
            success: true,
            message:"Email sent successfully!"
        }
        
    } catch (error) {
        console.error("error while sending email :", error)
        return {
            success: false,
            message:"Failed to send email!"
        }
    }
    
}