import User from '../models/User.js';

export const findByEmail = email => User.findOne({ email });

export const findByEmailWithPassword = email => User.findOne({ email }).select('+password');

export const createUser = user => User.create(user);
