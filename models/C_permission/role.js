const mongoose = require('mongoose');

const roleSchema =  mongoose.Schema({
    nameRole: String,
});

module.exports = mongoose.model('roles', roleSchema);