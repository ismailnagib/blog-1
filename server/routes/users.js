const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/userController')
const isLogin = require('../middlewares/isLogin')

router.post('/login', login)
router.post('/checklogin', isLogin, (req, res) => {res.status(200).json({isLogin: true})})
router.post('/register', register)

module.exports = router