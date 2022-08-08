var express = require('express');
var router = express.Router();
const LoginMiddleware = require('../middlewares/LoginMiddleware')

router.get('/', LoginMiddleware, function (req, res, next) {
  res.render('pages/index', { title: '首頁 - 台電核電廠疏散資訊平台' });
});

router.get('/login', function (req, res, next) {
  res.render('pages/login', { title: '登入 - 台電核電廠疏散資訊平台' });
})

module.exports = router;
