import axios from "axios";

export async function checkIfTheyNew(address: string): Promise<boolean> {
    try {
        // Check if user exists
        const response = await axios.get('/api/v1/user', { params: { address } });
        
        if (response.data.success) {
            console.log('Existing user detected!');
            return false; // User exists, so they're not new
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            // User not found, proceed to create new user
            console.log('New user detected!');
        } else {
            // Some other error occurred
            console.error('Error checking user:', error);
            throw error; // or handle it as you see fit
        }
    }

    // If we reach here, user doesn't exist, so create new user
    try {
        const createResponse = await axios.post('/api/v1/set-user', { address });
        if (createResponse.data.success) {
            console.log('Added new user!');
            return true; // New user was created
        } else {
            console.error('Failed to add new user');
            return false; // Failed to create new user
        }
    } catch (error) {
        console.error('Error creating new user:', error);
        throw error; // or handle it as you see fit
    }
}