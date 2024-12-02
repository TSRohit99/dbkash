import dbConnect from "@/lib/db/dbConnect";
import userModel from "../../../../models/user";
import { createResponse } from "@/helpers/CreateResponse";
import { headers } from 'next/headers'

export async function POST(): Promise<Response> {
    const address = (await headers()).get("x-user-address");
    try {
        await dbConnect();
        console.log("Connected to database, attempting to create data...");
        
        const newUser = await userModel.create({ address });
      
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
