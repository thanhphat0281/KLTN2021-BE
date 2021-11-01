const mongoose = require('mongoose');

const replySchema = mongoose.Schema({
    userID: String,
    content: String,
    createdAt: Date
});

module.exports = mongoose.model('replies', replySchema);