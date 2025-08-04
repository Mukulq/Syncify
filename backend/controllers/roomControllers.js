const Room = require("../models/Room");
const User = require("../models/User");
const ytdl = require("yt-dlp-exec");

exports.createRoom = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newRoom = new Room({
      createdBy: user._id,
      participants: [user._id],
      queue: [],
      currentSong: null,
    });

    let savedRoom = await newRoom.save();

    // Populate createdBy and participants (only username field)
    savedRoom = await savedRoom.populate([
      { path: "createdBy", select: "username" },
      { path: "participants", select: "username" },
    ]);

    return res.status(201).json({
      message: "Room created successfully.",
      room: savedRoom,
    });
  } catch (err) {
    console.error("Create room error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { userId } = req.body;
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    if (!room.participants.includes(user._id)) {
      room.participants.push(user._id);
      await room.save();
    }

    const populatedRoom = await room.populate([
      { path: "createdBy", select: "username" },
      { path: "participants", select: "username" },
    ]);

    return res.status(200).json({
      message: "Joined room successfully.",
      room: populatedRoom,
    });
  } catch (err) {
    console.error("Join room error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getRoomInfo = async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findById(roomId)
      .populate("participants", "username _id")
      .populate("queue.addedBy", "username _id");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      roomCode: room.roomCode,
      createdBy: room.createdBy,
      participants: room.participants,
      currentSong: room.currentSong,
      queue: room.queue,
      createdAt: room.createdAt,
    });
  } catch (err) {
    console.error("Error fetching room info:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addMusicToQueue = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, title, url, thumbnail } = req.body;

    if (!roomId || !userId || !title || !url || !thumbnail) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newSong = {
      title,
      url,
      thumbnail,
      addedBy: user._id,
    };

    room.queue.push(newSong);
    await room.save();

    const populatedRoom = await room.populate("queue.addedBy", "username");

    return res.status(200).json({
      message: "Song added successfully.",
      queue: populatedRoom.queue,
    });
  } catch (err) {
    console.error("Add music error:", err);
    return res.status(500).json({ message: "Failed to add song to queue." });
  }
};
