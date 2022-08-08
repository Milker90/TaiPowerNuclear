var express = require('express');
var router = express.Router();
const ctrl_auth = require('../../controllers/ctrl_auth')
const passport = require('../../auth/passport').passport

router.get('/logout', ctrl_auth.logout)
router.get('/captcha', ctrl_auth.captcha)
router.post('/login', passport.authenticate('signin', { session: false }), ctrl_auth.login)

module.exports = router;
