export async function GET(request:Request) {
    return Response.json({
        success : true,
        message :  "You're on the test page"
    },
{
    status: 200
})
}