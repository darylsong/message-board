const commentRouter = require('express').Router()
const Comment = require('../models/comment')
const Post = require('../models/post')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { SECRET } = require('../utils/config')

commentRouter.get('/', async (req, res) => {
    const comments = await Comment.find({}).populate('post', { title: 1 }).populate('user', { name: 1 })
    res.json(comments.map(comment => comment.toJSON()))
})

commentRouter.post('/', async (req, res) => {
    const body = req.body
    const token = req.token
    const decodedToken = jwt.verify(token, SECRET)

    if (!token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    if (!body.text || !body.postId) {
            res.status(400).end()
      } else {
            const post = await Post.findById(body.postId)

            if (!post) {
                res.status(400).end()
            }

            const comment = new Comment({
                upvotes: 0,
                downvotes: 0,
                content: [
                    {
                        text: body.text,
                        date: new Date()
                    }
                ],
                post: post._id,
                user: user._id
            })
        
            const savedComment = await comment.save()
            post.comments = post.comments.concat(savedComment._id)
            await post.save()
            user.comments = user.comments.concat(savedComment._id)
            await user.save()

            res.json(savedComment)
      }
})

commentRouter.delete('/:id', async (req, res) => {
    const comment = await Comment.findById(req.params.id)
    const token = req.token
    const decodedToken = jwt.verify(token, SECRET)

    if (!token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    if (comment.user.toString() === user.id.toString()) {
        await Comment.findByIdAndDelete(req.params.id)
        res.status(204).end()
    } else {
        return res.status(401).json({ error: 'you do not have permission to delete this section' })
    }
})

commentRouter.put('/:id', async (req, res) => {
    const comment = await Comment.findById(req.params.id)
    const token = req.token
    const decodedToken = jwt.verify(token, SECRET)

    if (!token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    if (comment.user.toString() === user.id.toString()) {
        const body = await req.body

        const comment = {
            upvotes: body.upvotes,
            downvotes: body.downvotes,
            content: body.content,
            post: body.post
        }

        const updatedComment = await Comment.findByIdAndUpdate(req.params.id, comment, { new: true })
        res.json(updatedComment.toJSON())
    } else {
        return res.status(401).json({ error: 'you do not have permission to delete this section' })
    }
})

commentRouter.get('/:id', async (req, res) => {
    const comment = await Comment.findById(req.params.id)
    if (comment) {
      res.json(comment)
    } else {
      res.status(404).end()
    }
})

module.exports = commentRouter