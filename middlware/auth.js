const jwt = require('jsonwebtoken');
const { Users } = require('../models/users');

const isAuthenticated = async (req, res, next) => {
    try {
        if(!req.headers.authorization){
            return next('JWT token not found');
        }
        const token = req.headers.authorization.split(' ')[1];
        // console.log(token);
        if (!token) {
            return next('Please login to access the data');
        } else {
            const verify = jwt.verify(token, process.env.SECRET_KEY);
            req.user = verify;
            next();
        }
    } catch (error) {
        return next(error);
    }
}

module.exports = isAuthenticated;
