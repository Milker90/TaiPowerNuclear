const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = function (req, res, next) {
    try {
        let token = req.cookies.tpntoken
        if (!token) {
            throw new Error('token is missing')
        }
        jwt.verify(token, process.env.JWT_SALT, function (err, decoded) {
            if (err) {
                throw new Error(err.message)
            }
        })
    } catch (error) {
        return res.redirect('/login')
    }
    next()
}