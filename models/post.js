const mongoose = require('mongoose')

mongoose.set('useFindAndModify', false)

const postSchema = new mongoose.Schema({
    title: String,
    upvotes: Number,
    downvotes: Number,
    content: [],
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

postSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Post', postSchema)