export interface ApiResponse {
    success : boolean;
    message? : string;
    data? : any;
    authToken?: string;
}