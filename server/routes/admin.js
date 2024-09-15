const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const adminLayout = '../views/layouts/admin'

const jwtSecret = process.env.JWT_SECRET

/**
 * 
 * Check Login
 */
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        return res.status(401).json({ message: '无权进入梦境'}) // 改成一个没有登录权限的页面 更好看
    }
    try {
        const decoded = jwt.verify(token, jwtSecret)
        req.userId = decoded.userId
        next()
    } catch (error) {
        res.status(401).json({ message: '无权进入梦境'}) // 改成一个没有登录权限的页面 更好看
    }
}

/**
 * GET /
 * Admin - Login Page
 */
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: '心灵之窗',
            description: '在这里，我们用文字谱写心灵的乐章，探索思想的深度与广度。'
        }
        
        res.render('admin/index', { locals, layout: adminLayout })
    } catch (error) {
        console.log(error)
    }
})

/**
 * POST /
 * Admin - Check Login
 */
router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(401).json({ message: '梦境之名或秘钥错误' }) // 改成一个账号或密码的页面 更好看
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: '梦境之名或秘钥错误' }) // 改成一个账号或密码的页面 更好看
        }
        const token = jwt.sign({ userId: user._id }, jwtSecret)
        res.cookie('token', token, { httpOnly: true })
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error)
    }
})

/**
 * GET /
 * Admin - Dashboard
 */
router.get('/dashboard', authMiddleware, async (req, res) => {
    res.render('admin/dashboard')
})

/**
 * POST /
 * Admin - Register
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)

        try {
           const user = await User.create({ username, password: hashedPassword }) 
           res.status(201).json({ message: '梦旅人创建成功', user })
        } catch (error) {
            if (error.code === '11000') {
                res.status(409).json({ message: '梦境之名已存在' })
            }
            res.status(500).json({ message: '在梦境中迷失，请重试' })
        }
    } catch (error) {
        console.log(error)
    }
})

module.exports = router