

export interface ApiResponse {
    success : boolean;
    message : string;
    extraInfo?: string;
    transactions?: Array<Object>;
}