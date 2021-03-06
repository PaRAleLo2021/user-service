import mongoose,{ Schema } from 'mongoose';
import logging from '../config/logging';
import IUser from '../interfaces/user';
var uniqueValidator = require('mongoose-unique-validator');
import crypto from 'crypto';

const UserSchema: Schema = new Schema(
    {
        username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
        password: {type: String, required: [true, "can't be blank"]},
        salt: {type: String},
        hash: {type: String},
        email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
        score: {type: Number}
    },
    {
        timestamps: true
    }
);

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

UserSchema.pre<IUser>('save', function () {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(this.password, this.salt, 10000, 512, 'sha512').toString('hex');
    this.password = "";
    this.score = 0;
    logging.info('Mongo', 'User details set', this);
})

export default mongoose.model<IUser>('User', UserSchema);
