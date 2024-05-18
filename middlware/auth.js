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
            jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        return res.status(401).json({ message: 'JWT token has expired' });
                    } else if (err.name === 'JsonWebTokenError') {
                        return res.status(401).json({ message: 'Invalid JWT token' });
                    } else if (err.name === 'NotBeforeError') {
                        return res.status(401).json({ message: 'JWT token not active' });
                    } else {
                        return next(err);
                    }
                }
    
                req.user = decoded;
                next();
            });
        }
    } catch (error) {
        return next(error);
    }
}

module.exports = isAuthenticated;
