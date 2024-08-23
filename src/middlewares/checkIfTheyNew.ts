import axios from "axios";

export async function checkIfTheyNew(): Promise<boolean> {
    try {
        // Check if user exists
        const response = await axios.get('/api/v1/user');
        console.log('res ', response)
        
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
        const res = await axios.post('/api/v1/set-user');
        if (res.data.success) {
            console.log('Added new user!');
            return true; // New user was created
        } else {
            console.error('Failed to add new user');
            console.log(res);
            throw new Error('Error on creating new user!');
        }
    } catch (error) {
        console.error('Error creating new user:', error);
        throw error; // or handle it as you see fit
    }
}