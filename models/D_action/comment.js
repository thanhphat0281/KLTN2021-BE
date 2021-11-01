const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    bookID: String,
    userID: String,
    commentDate: String,
    time: String,
    content: String,
    replies: []
});

module.exports = mongoose.model('comments', commentSchema);