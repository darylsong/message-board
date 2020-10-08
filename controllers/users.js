const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('sections', { name: 1 }).populate('posts', { title: 1 })
    response.json(users)
})

usersRouter.get('/:id', async (request, response) => {
    const user = await User.findById(request.params.id).populate('section', { name: 1 }).populate('posts', { title: 1 })
    if (user) {
        response.json(user)
    } else {
        response.status(404).end()
    }
})

usersRouter.post('/', async (request, response) => {
    const body = request.body

    if (!body.username) {
        return response.status(400).json({ error: 'username missing' })
    } else if (!body.password) {
        return response.status(400).json({ error: 'password missing' })
    } else if (!body.name) {
        return response.status(400).json({ error: 'name missing' })
    } else if (!body.email) {
        return response.status(400).json({ error: 'email missing' })
    }
    
    if (body.username.length < 6) {
        return response.status(400).json({ error: 'username must be at least 6 characters long' })
    } else if (body.password.length < 6) {
        return response.status(400).json({ error: 'password must be at least 6 characters long' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash,
        email: body.email
    })

    const savedUser = await user.save()

    response.json(savedUser)
})

module.exports = usersRouter