import mongoose,{ Schema } from 'mongoose';
import logging from '../config/logging';
import IUser from '../interfaces/user';

const UserSchema: Schema = new Schema(
    {
        username: {type: String, required: true},
        password: {type: String, required: true},
        email: {type: String, required: true},
        extraInformation: {type: String}
    },
    {
        timestamps: true
    }
);

UserSchema.post<IUser>('save', function () {
    this.extraInformation = "This is some extra info that was put onto this entry after the save :))";
    logging.info('Mongo', 'Checkout the user we just saved: ', this);
})

export default mongoose.model<IUser>('User', UserSchema);
