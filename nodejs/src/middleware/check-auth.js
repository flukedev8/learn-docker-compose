const jwt = require('jsonwebtoken');
const env = process.env.JWT_KEY ||'database' ;
const config = require('../config/keys')[env];


module.exports = (req, res, next)=>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, config.JWT_KEY);
        req.userData = decoded;
        next();
    }catch(error){
        return res.status(401).json({
            message: 'Auth failed'
        });
    }

};