let mongoose = require('mongoose');
const postSchema = mongoose.Schema({
    name: {type: String},
    price: {type: Number},
    description: {type: String},
    type: {type: String},
    sl: {type: Number},
    image: {type: String}
});
module.exports = postSchema;