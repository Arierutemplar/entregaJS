import User from '../models/User.js';

export const findByEmail = email => User.findOne({ email });

export const createUser = user => User.create(user);
