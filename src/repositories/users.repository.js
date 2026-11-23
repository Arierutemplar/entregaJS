import * as usersDao from '../dao/users.dao.js';

export const findByEmail = email => usersDao.findByEmail(email);

export const createUser = user => usersDao.createUser(user);
