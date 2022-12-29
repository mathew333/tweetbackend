const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
    loginId: { type: String },
    firstName: {type: String},
    lastName: {type: String},
    message: { type: String},
    tags: [{type: Object}],
    image: { type: String, default: null },
    replies: [{
        message: {type: String},
        userLoginId: { type: String},
        firstName: {type: String},
        lastName: {type: String}
    }],
    likes: [{type: String}],
    lastModifiedDate: { type: Date}
});

module.exports = mongoose.model('tweet', tweetSchema);