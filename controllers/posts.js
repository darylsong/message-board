const postRouter = require('express').Router()
const Post = require('../models/post')
const Section = require('../models/section')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { SECRET } = require('../utils/config')

postRouter.get('/', async (req, res) => {
    const posts = await Post.find({}).populate('section', { name: 1 }).populate('comments', { content: 1 }).populate('user', { name: 1 })
    res.json(posts.map(post => post.toJSON()))
})

postRouter.post('/', async (req, res) => {
    const body = req.body
    const token = req.token
    const decodedToken = jwt.verify(token, SECRET)

    if (!token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    if (!body.title || !body.text || !body.sectionId) {
            res.status(400).end()
      } else {
            const section = await Section.findById(body.sectionId)

            if (!section) {
                res.status(400).end()
            }

            const post = new Post({
                title: body.title,
                upvotes: 0,
                downvotes: 0,
                content: [
                    {
                        text: body.text,
                        date: new Date()
                    }
                ],
                section: section._id,
                comments: [],
                user: user._id
            })
        
            const savedPost = await post.save()
            section.posts = section.posts.concat(savedPost._id)
            await section.save()
            user.posts = user.posts.concat(savedPost._id)
            await user.save()

            res.json(savedPost)
      }
})

postRouter.delete('/:id', async (req, res) => {
    const post = await Post.findById(req.params.id)
    const token = req.token
    const decodedToken = jwt.verify(token, SECRET)

    if (!token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    if (post.user.toString() === user.id.toString()) {
        await Post.findByIdAndDelete(req.params.id)
        res.status(204).end()
    } else {
        return res.status(401).json({ error: 'you do not have permission to delete this section' })
    }
})

postRouter.put('/:id', async (req, res) => {
    const post = await Post.findById(req.params.id)
    const token = req.token
    const decodedToken = jwt.verify(token, SECRET)

    if (!token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    if (post.user.toString() === user.id.toString()) {
        const body = await req.body

        const post = {
            title: body.title,
            upvotes: body.upvotes,
            downvotes: body.downvotes,
            content: body.content,
            section: body.section,
            comments: body.comments
        }
    
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, post, { new: true })
        res.json(updatedPost.toJSON())
    } else {
        return res.status(401).json({ error: 'you do not have permission to delete this section' })
    }
})

postRouter.get('/:id', async (req, res) => {
    const post = await Post.findById(req.params.id)
    if (post) {
      res.json(post)
    } else {
      res.status(404).end()
    }
})

module.exports = postRouter