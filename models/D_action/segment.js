const mongoose = require('mongoose');

const segmentSchema = mongoose.Schema({
    nameWheel: String,
    segments: [
        {
            fillStyle: String,
            text: String
        }
    ],
    isActive: Boolean
});

module.exports = mongoose.model('segments', segmentSchema);