import mongoose, {Schema, Document} from "mongoose";

export interface user extends Document {
    address: string,
    username?: string,
    email?: string,
    addressBook?: any[],
    createdAt: Date,
    pendingEmail?:string,
    verificationCode?: string,
    verificationCodeExpires?: Date,
}

const userSchema: Schema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: false,
        default: 'Anon',
    },
    email: {
        type: String,
        required: false,
        default: '',
    },
    addressBook: [Schema.Types.Mixed],

    createdAt: {
        type: Date,
        default: Date.now
    },
    pendingEmail: {
        type: String,
        required: false,
        default: null,
    },
    verificationCode: {
        type: String,
        required: false,
        default: null,
    },
    verificationCodeExpires: {
        type: Date,
        default: null,
    },

});

const userModel = mongoose.models.users || mongoose.model<user>("users", userSchema);
export default userModel;