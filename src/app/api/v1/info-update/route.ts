import dbConnect from "@/lib/db/dbConnect";
import userModel from "@/app/models/user";
import { createResponse } from "@/helpers/CreateResponse";

export async function POST(request: Request): Promise<Response> {
    const req = await request.json();
    const { address, name } = req;

    await dbConnect();

    if (!address) {
        return createResponse({
            success: false,
            message: "No user address provided"
        }, 400);
    }

    try {
        console.log("Connected to database, attempting to update data...");

        // Find user by userAddress and update the username
        const user = await userModel.findOneAndUpdate(
            { address: address },  // Find the document with this address
            { $set: { username: name } },  // Update the username field
            { new: true }  // Return the updated document
        );

        if (!user) {
            console.log("No user found with the provided address.");
            return createResponse({
                success: false,
                message: "User not found"
            }, 404);
        }

        return createResponse({
            success: true,
            data: user
        }, 200);

    } catch (error) {
        console.error('Error updating user data:', error);
        return createResponse({
            success: false,
            message: "Internal server error"
        }, 500);
    }
}
