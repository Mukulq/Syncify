const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  title: String,
  url: String,
  thumbnail: String,
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const roomSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  queue: [songSchema],
  currentSong: songSchema,

  // 🔽 New fields for video sync logic
  isPlaying: {
    type: Boolean,
    default: false,
  },
  videoStartTime: {
    type: Date,
    default: null,
  },
  lastPausedAt: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Room", roomSchema);
