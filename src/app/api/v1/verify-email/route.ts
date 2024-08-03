export async function GET(request:Request) {
    return Response.json({
        success : true,
        message :  "You're on the verify-email page"
    },
{
    status: 200
})
}