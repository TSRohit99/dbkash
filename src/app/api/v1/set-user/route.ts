import dbConnect from "@/lib/db/dbConnect";
import userModel from "@/app/models/user";
import { createResponse } from "@/helpers/CreateResponse";
import { headers } from 'next/headers'

export async function POST(): Promise<Response> {
    const address = headers().get("x-user-address");
    
    if (!address) {
        return createResponse({
            success: false,
            message: "No user address provided"
        }, 400);
    }

    try {
        await dbConnect();
        console.log("Connected to database, attempting to create data...");
        
        const newUser = await userModel.create({ address });
        console.log("User after create:", newUser);
      
        return createResponse({
            success: true,
            data: newUser
        }, 201);
    } catch (error) {
        console.error('Error creating user data:', error);
        return createResponse({
            success: false,
            message: "Internal server error",
        }, 500);
    }
}
