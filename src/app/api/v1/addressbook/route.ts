import dbConnect from "@/lib/db/dbConnect";
import userModel from "../../../../models/user";
import { createResponse } from "@/helpers/CreateResponse";
import { headers } from "next/headers";

export async function POST(request: Request): Promise<Response> {
  const req = await request.json();
  const { name, address } = req;

  const userAddress = ( await headers()).get("x-user-address");

  try {
    await dbConnect();
    console.log("Connected to database, attempting to update data...");

    // Find user by userAddress and update the addressBook array
    const user = await userModel.findOneAndUpdate(
      { address: userAddress },
      { $push: { addressBook: { name, address } } },
      { new: true } // Return the updated document
    );

    console.log("User after update:", user);

    if (!user) {
      console.log("No user found with the provided address.");
      return createResponse(
        {
          success: false,
          message: "User not found",
        },
        404
      );
    }

    return createResponse(
      {
        success: true,
        data: user,
      },
      200
    );
  } catch (error) {
    console.error("Error updating user data:", error);
    return createResponse(
      {
        success: false,
        message: "Internal server error",
      },
      500
    );
  }
}
