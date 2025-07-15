const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sessionId: String,
  role: String,
  content: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = {
  saveMessage: async (sessionId, role, content) => {
    const message = new Message({ sessionId, role, content });
    await message.save();
  },

  getRecentMessages: async (sessionId, limit = 10) => {
    return Message.find({ sessionId }).sort({ timestamp: -1 }).limit(limit).lean();
  }
};
