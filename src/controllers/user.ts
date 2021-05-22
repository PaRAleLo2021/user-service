import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import logging from '../config/logging';
import User from '../models/user';
import crypto from 'crypto';
import signJWT from '../functions/signJWT'

const NAMESPACE = 'Users';

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, "Token validated, user authorized");

    return res.status(200).json({
        message: "Authorized"
    })
};

const login = (req: Request, res: Response, next: NextFunction) => {
    let { email, password } =req.body;

    User.find({email: email})
    .exec()
    .then(users => {
        if(users.length!== 1){
            return res.status(401).json({
                message: users.length+'Unauthorized'
            });
        }
    
        var hash = "";
        hash = crypto.pbkdf2Sync(password, users[0].salt, 10000, 512, 'sha512').toString('hex');

        if(hash == users[0].hash){
            signJWT(users[0], (_error, token) => {
                if(_error){
                    logging.error(NAMESPACE, 'Unable to sign token: ', _error);

                    return res.status(401).json({
                        email: email,
                        message: 'Unauthorized',
                        error: _error
                    });
                }
                if(token){
                    return res.status(200).json({
                        message: 'Auth Successful',
                        token,
                        user: users[0]
                    });
                }
            });
        }else{
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }
    })
    .catch(error => {
        return res.status(500).json({
            message: error.message,
            error
        });
    })
};

const register = (req: Request, res: Response, next: NextFunction) => {
    let { username, password, email } = req.body;

    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        username,
        password,
        email
    });

    return user
        .save()
        .then((result) => {
            console.log("here");
            return res.status(201).json({
                user: result
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.message,
                error
            });
        });
};

const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
    User.find()
    .select('-password -hash -salt')
    .exec()
        .then((users) => {
            return res.status(200).json({
                users: users,
                count: users.length
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.message,
                error
            });
        });
};

//to be implemented
const updateScore = (req: Request, res: Response, next: NextFunction) => {
    User.find()
    .select('-password -hash -salt')
    .exec()
        .then((users) => {
            return res.status(200).json({
                users: users,
                count: users.length
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.message,
                error
            });
        });
};

const updateUser = (req: Request, res: Response, next: NextFunction) => {
    let { _id, username, email, password} = req.body;

    var user: Object;

    if(password!="") {
        let salt = crypto.randomBytes(16).toString('hex');
        let hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
        user = {
            username: username,
            email: email,
            hash: hash,
            salt: salt,
        }
    } else {
        user = {
            username: username,
            email: email
        }
    }
    
    User.findByIdAndUpdate(_id,{$set: user}, { new: true }, function(err, result){
        if(err){
            return res.status(500).json({
                message: err.message,
                err
            });
        }
        else{
            return res.status(201).json({
                user: result
            });
        }
    });
};

export default { validateToken, login, register, getAllUsers, updateUser};