import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import logging from '../config/logging';
import User from '../models/user';
var crypto = require('crypto');

const NAMESPACE = 'Users Controller';

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, "Token validated, user authorized");

    return res.status(200).json({
        message: "Authorized"
    })
};

const login = (req: Request, res: Response, next: NextFunction) => {
    let { username, password } =req.body;

    
};

const createUser = (req: Request, res: Response, next: NextFunction) => {
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

export default { createUser, getAllUsers };