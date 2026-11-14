const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  branch: { type: String, required: true },
  subject: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  scores: [ScoreSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
