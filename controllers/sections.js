const sectionRouter = require('express').Router()
const Section = require('../models/section')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { SECRET } = require('../utils/config')

sectionRouter.get('/', async (req, res) => {
    const sections = await Section.find({}).populate('posts', { title: 1, content: 1 }).populate('user', { username: 1, name: 1, id: 1 })
    res.json(sections.map(section => section.toJSON()))
})

sectionRouter.post('/', async (req, res) => {
    const body = req.body
    const token = req.token
    const decodedToken = jwt.verify(token, SECRET)

    if (!token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    if (!body.name || !body.description) {
        res.status(400).end()
    } else {
        const section = new Section({
            name: body.name,
            description: body.description,
            posts: [],
            user: user._id
        })
        
        const savedSection = await section.save()
        user.sections = user.sections.concat(savedSection._id)
        await user.save()

        res.json(savedSection)
    }
})

sectionRouter.delete('/:id', async (req, res) => {
    const section = await Section.findById(req.params.id)
    const token = req.token
    const decodedToken = jwt.verify(token, SECRET)

    if (!token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    if (section.user.toString() === user.id.toString()) {
        await Section.findByIdAndDelete(req.params.id)
        res.status(204).end()
    } else {
        return res.status(401).json({ error: 'you do not have permission to delete this section' })
    }
})

sectionRouter.put('/:id', async (req, res) => {
    const section = await Section.findById(req.params.id)
    const token = req.token
    const decodedToken = jwt.verify(token, SECRET)

    if (!token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    if (section.user.toString() === user.id.toString()) {
        const body = await req.body

        const section = {
            name: body.name,
            description: body.description,
            posts: body.posts,
            user: user._id
        }
    
        const updatedSection = await Section.findByIdAndUpdate(req.params.id, section, { new: true })
        res.json(updatedSection.toJSON())
    } else {
        return res.status(401).json({ error: 'you do not have permission to edit this section' })
    }
})

sectionRouter.get('/:id', async (req, res) => {
    const section = await Section.findById(req.params.id)
    if (section) {
      res.json(section)
    } else {
      res.status(404).end()
    }
})

module.exports = sectionRouter