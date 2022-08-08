const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports = {
    hash: function (plaintext) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(plaintext, 10, function (err, hash) {
                if (err) reject(err)
                resolve(hash)
            })
        })
    }
}