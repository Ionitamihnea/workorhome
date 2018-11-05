const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  work: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    username: String,
  },
});

module.exports = mongoose.model('Post', PostSchema);
