const svgCaptcha = require('svg-captcha')
const jwt = require('jsonwebtoken')
var { v1: uuidv1 } = require('uuid');
const { hash } = require('../helpers')
require('dotenv').config()
const sequelize = require('../models/index').sequelize
let initModels = require("../models/init-models")
let models = initModels(sequelize)
let User = models.users

async function captcha(req, res, next) {
    var captcha = svgCaptcha.create({
        size: 4,
        noise: 1,
        color: true,
        background: '#cc9966',
        charPreset: '0123456789'
    });
    req.session.captcha = captcha.text;
    res.type('svg');
    res.status(200).send(captcha.data);
}

async function login(req, res, next) {
    try {
        var token = jwt.sign(req.user, process.env.JWT_SALT, {
            expiresIn: 60 * 60, // seconds
            jwtid: uuidv1()
        })

        let captcha = req.body.captcha
        let sessionCaptcha = req.session.captcha
        if (captcha == sessionCaptcha) {
            res.cookie('tpntoken', token, {
                httpOnly: true,
                maxAge: new Date(Date.now() + 60 * 60 * 24 * 3),
            })
            res.json({
                success: true,
                user: req.user.username
            })
            // res.json({
            //     success: true,
            //     message: 'This is your token',
            //     token: token,
            //     user: req.user.username
            // })
        } else {
            res.status(400).json({
                success: false,
                msg: '驗證碼錯誤'
            })
        }

    } catch (error) {
        console.error(error)
    }
}

async function logout(req, res, next) {
    res.cookie('tpntoken', '', {
        expires: new Date(Date.now())
    })
    res.cookie('tpnuser', '', {
        expires: new Date(Date.now())
    })
    res.redirect('/')
}

module.exports = {
    captcha,
    login,
    logout
}