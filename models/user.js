const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema(
    {
        // firstName: {type: String, required: true, maxLength: 50},
        // lastName: {type: String, required: true, maxLength: 50},
        username: {type: String, required: true, maxLength: 50},
        password: { type: String, required: true, minLength: 1 },
        member: {type: Boolean, default: false},
        admin: {type: Boolean, default: false}
    }
)
UserSchema.virtual('url').get(function () {
    return '/user/'+ this._id
})

module.exports = mongoose.model('User', UserSchema)