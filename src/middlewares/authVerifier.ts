import axios from 'axios'

export async function authVerifier(signature:string, address:string) : Promise<string> {
    try {
        const res = await axios.post('/api/v1/user-auth', {
            signature,
            address
        });
        console.log('auth',res)

        if(res.data.success){
            console.log(res.data.message || "Auth success!");
            const token = res.data.authToken
            return token;
        }else{
            console.log(res.data.message || "Auth failed!");
            console.log(res);
            throw new Error('Error on authController ');
        }
    } catch (error) {
        console.log("Error on authController : ", error);
        throw error;
    }
}