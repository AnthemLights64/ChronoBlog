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
        return res.status(401).json({ message: '无权进入梦境'}) // 改成一个没有登录权限的页面 更好看 添加按钮 去登录
    }
    try {
        const decoded = jwt.verify(token, jwtSecret)
        req.userId = decoded.userId
        next()
    } catch (error) {
        res.status(401).json({ message: '无权进入梦境'}) // 改成一个没有登录权限的页面 更好看 添加按钮 去登录
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
    try {
        const locals = {
            title: '梦旅人之界',
            description: '在这里，我们用文字谱写心灵的乐章，探索思想的深度与广度。'
        }
        const data = await Post.find()
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        })
    } catch (error) {
        console.log(error)
    }
})

/**
 * GET /
 * Admin - Create New Post
 */
router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: '记录梦境',
            description: '在这里，我们用文字谱写心灵的乐章，探索思想的深度与广度。'
        }
        const data = await Post.find()
        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        })
    } catch (error) {
        console.log(error)
    }
})

/**
 * POST /
 * Admin - Create New Post
 */
router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            })
            await Post.create(newPost)
            res.redirect('/dashboard')

        } catch (error) {
            console.log(error)
        }
    } catch (error) {
        console.log(error)
    }
})

/**
 * GET /
 * Admin - Edit Post
 */
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: '梦语重塑',
            description: '在这里，我们用文字谱写心灵的乐章，探索思想的深度与广度。'
        }
        const data = await Post.findOne({ _id: req.params.id })
        res.render('admin/edit-post', {
            locals,
            data,
            layout: adminLayout
        })
    } catch (error) {
        console.log(error)
    }
})

/**
 * PUT /
 * Admin - Edit Post
 */
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        })
        res.redirect(`/edit-post/${req.params.id}`)
    } catch (error) {
        console.log(error)
    }
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

/**
 * DELETE /
 * Admin - Delete Post
 */
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (error) {
        console.error
    }
})

/**
 * GET /
 * Admin - Logout
 */
router.get('/logout', async (req, res) => {
    res.clearCookie('token')
    res.redirect('/')
})

module.exports = router