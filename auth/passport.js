const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const sequelize = require('../models/index').sequelize
let initModels = require("../models/init-models")
let models = initModels(sequelize)
let User = models.users
require('dotenv').config()

// local stradge part
passport.use('signin', new LocalStrategy({ usernameField: 'username', passwordField: 'pd' }, async (username, pd, done) => {

  try {
    let user = await User.findOne({
      where: { username: username }
    })
    if (!user) {
      return done(null, false, { message: "my err" }) // user not found
    }

    await Verify_hash(pd, user)

    // setting what u want in jwt token
    const jwtUserInfo = {
      id: user.userId,
      username: user.username,
      email: user.email,
    }

    done(null, jwtUserInfo)

  } catch (error) {
    if (error.message == 'worngPassword') {
      done(null, false) // wrong pwd
    } else {
      done(error) // error
    }
  }
}))

// jwt part
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.JWT_SALT
passport.use('jwt', new JwtStrategy(opts, function (jwt_payload, done) {
  User.findOne({
    where: { id: jwt_payload.id }
  }).then(user => {
    if (user) {
      return done(null, user)
    } else {
      return done(null, false)
      // or you could create a new account
    }
  }).catch(err => {
    return done(err, false)
  })
}))

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  var token = req.body.token || req.query.token || req.headers['authorization'] || req.cookies.token
  if (token) {
    jwt.verify(token, process.env.JWT_SALT, function (err, decoded) {
      if (err) {
        // return res.json({ success: false, message: 'Failed to authenticate token.' })
        return res.redirect('/login')
      } else {
        req.decoded = decoded
        next()
      }
    })
  } else {
    return res.redirect('/login')
    // return res.status(403).send({
    //   success: false,
    //   message: 'No token provided.'
    // })
  }
};


exports.isInRole = (roleNameNormalized) => (req, res, next) => {
  let hasRoles = [...req.decoded.hasRoles]
  let found = hasRoles.find(ele => ele.roleNameNormalized == roleNameNormalized)
  if (found) {
    next()
  } else {
    if (req.baseUrl.startsWith("/api")) {
      res.status(403).json({ success: false, msg: "UnAuthorized." })
    } else {
      res.redirect('/notAuthorized')
    }
  }
};

exports.hasClaim = (claimType) => (req, res, next) => {
  let hasClaims = [...req.decoded.hasClaim]
  let found = hasClaims.find(ele => ele.claimType == claimType)
  if (found) {
    next()
  } else {
    if (req.baseUrl.startsWith("/api")) {
      res.status(403).json({ success: false, msg: "UnAuthorized." })
    } else {
      res.redirect('/notAuthorized')
    }
  }
};

exports.passport = passport


function Verify_hash(plaintextPassword, user) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plaintextPassword, user.pd).then(result => {
      result ? resolve(user) : reject(new Error('worngPassword'))
    }).catch(err => {
      console.error(err)
      reject()
    })
  })
}
