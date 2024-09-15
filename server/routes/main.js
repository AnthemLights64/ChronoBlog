const express = require('express')
const router = express.Router()
const Post = require('../models/Post')

/**
 *  GET /
 *  Home
 */
router.get('', async (req, res) => {
    try {
        const locals = {
            title: 'Chrono Blog',
            description: '在这里，我们用文字谱写心灵的乐章，探索思想的深度与广度。'
        }

        let perPage = 10
        let page = req.query.page || 1

        const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec()

        const count = await Post.countDocuments()
        const nextPage = parseInt(page) + 1
        const hasNextPage = nextPage <= Math.ceil(count / perPage)

        res.render('index', { 
            locals, 
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null
        })

    } catch (error) {
        console.log(error)
    }

})

/**
 *  GET /
 *  Post :id
 */
router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id

        const data = await Post.findById({ _id: slug })

        const locals = {
            title: data.title,
            description: '在这里，我们用文字谱写心灵的乐章，探索思想的深度与广度。'
        }

        res.render('post', { locals, data })
    } catch (error) {
        
    }
})

/**
 *  POST /
 *  Post - searchTerm
 */
router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "寻觅之窗",
            description: '在这里，我们用文字谱写心灵的乐章，探索思想的深度与广度。'
        }
        let searchTerm = req.body.searchTerm
        // const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")
        const searchNoSpecialChar = searchTerm.replace(/[^\w\s\u4e00-\u9fa5]/g, "") // \u4e00-\u9fa5 是中文字符的 Unicode 范围
        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
            ]
        })
        res.render('search', {
            data,
            locals
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/about', (req, res) => {
    res.render('about')
})

router.get('/contact', (req, res) => {
    res.render('contact')
})

module.exports = router

// function insertPostData () {
//     Post.insertMany([
//         {
//             title: '晨曦中的微光',
//             body: '在晨曦的微光中，世界仿佛被镀上了一层金色的薄纱，宁静而美好。'
//         },
//         {
//             title: '夜空中的繁星',
//             body: '夜幕降临，繁星点点，仿佛在诉说着古老而神秘的故事。'
//         },
//         {
//             title: '秋日的私语',
//             body: '秋风轻拂，落叶飘零，仿佛大自然在低声呢喃着秋日的私语。'
//         },
//         {
//             title: '雨后的彩虹',
//             body: '雨后的天空，彩虹横跨天际，宛如一座通向梦幻世界的桥梁。'
//         },
//         {
//             title: '静谧的湖畔',
//             body: '湖畔静谧，水波不兴，仿佛时间在这一刻停滞，心灵得以宁静。'
//         },
//         {
//             title: '花开的声音',
//             body: '春日的花园里，花朵悄然绽放，仿佛能听到它们在轻声歌唱。'
//         },
//         {
//             title: '风中的呢喃',
//             body: '微风拂过，树叶沙沙作响，仿佛大自然在耳边低语。'
//         },
//         {
//             title: '星辰大海',
//             body: '仰望星空，浩瀚的星辰如同大海中的浪花，令人心生敬畏。'
//         },
//         {
//             title: '梦中的诗篇',
//             body: '在梦境的深处，一首首诗篇如泉水般涌出，诉说着心灵的故事。'
//         },
//         {
//             title: '心灵的归宿',
//             body: '在宁静的角落里，心灵找到了归宿，仿佛一切都变得如此美好。'
//         }
//     ])
// }
// insertPostData()