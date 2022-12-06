const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new Schema(
    {
        title: {type: String, required: true, maxLength: 50},
        created: {type: Date, required: true, maxLength: 50},
        text: {type: String, required: true, maxLength: 250},
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    }
)
PostSchema.virtual('url').get(function () {
    return '/post/'+ this._id
})

module.exports = mongoose.model('Post', PostSchema)