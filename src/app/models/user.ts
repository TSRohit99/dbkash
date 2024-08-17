import mongoose, {Schema, Document} from "mongoose";

export interface user extends Document {
    address: string,
    username?: string,
    email?: string,
    addressBook?: any[],
    createdAt: Date,
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
    }
});

const userModel = mongoose.models.users || mongoose.model<user>("users", userSchema);
export default userModel;