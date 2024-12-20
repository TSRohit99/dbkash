import VerificationEmail from "../../emails/verificationEmail";
import { ApiResponse } from "@/types/ApiResponse";
import { mailOptions, transporter } from "@/lib/nodemailer";
import { render } from "@react-email/components";
import { createElement } from "react";

export async function sendNMVerificationEmail( 
    username: string,
    email: string,
    verifyCode : string,
):Promise<ApiResponse>{

    try {
        const emailComponent = createElement(VerificationEmail, {
            username,
            otp: verifyCode
        });

        // Render React email template to HTML
        const emailHtml = render(emailComponent);

        await transporter.sendMail({
            ...mailOptions,
            to : email,
            html: emailHtml
        });
        
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