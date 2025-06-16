const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'model']
  },
  parts: [{
    text: String
  }]
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true // Add index for faster queries
  },
  history: {
    type: [messageSchema],
    default: []
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  },
});

// Update pre-save middleware
conversationSchema.pre('save', function(next) {
  this.lastInteraction = Date.now();
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
