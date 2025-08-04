const Room = require("../models/Room");

function roomSocketHandlers(socket, io) {
  socket.on("load-video", async ({ roomId, video }) => {
    const now = new Date();

    const room = await Room.findByIdAndUpdate(
      roomId,
      {
        currentSong: video,
        videoStartTime: now,
      },
      { new: true }
    );

    if (room) {
      socket.to(roomId).emit("load-video", { video });
    }
  });

  socket.on("join-room", async (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);

    const room = await Room.findById(roomId);
    if (!room || !room.videoStartTime) return;

    const elapsed = (Date.now() - new Date(room.videoStartTime)) / 1000;

    // Tell the new user to sync playback
    socket.emit("sync-play", {
      currentTime: elapsed,
    });
  });

  socket.on("play-video", async ({ roomId }) => {
    const room = await Room.findById(roomId);

    if (!room) return;

    let startTime = Date.now();
    let videoStartTime = room.videoStartTime;

    // If video was paused, resume from that point
    if (room.lastPausedAt != null) {
      // Set new start time relative to paused point
      videoStartTime = new Date(Date.now() - room.lastPausedAt * 1000);
    }

    await Room.findByIdAndUpdate(roomId, {
      isPlaying: true,
      videoStartTime,
      lastPausedAt: null, // clear pause
    });

    socket.to(roomId).emit("sync-play", {
      currentTime: room.lastPausedAt || 0,
      isPlaying: true,
    });
  });

  socket.on("pause-video", async ({ roomId }) => {
    const room = await Room.findById(roomId);

    if (room?.videoStartTime) {
      const elapsed = (Date.now() - room.videoStartTime) / 1000;

      await Room.findByIdAndUpdate(roomId, {
        isPlaying: false,
        lastPausedAt: elapsed,
      });

      socket.to(roomId).emit("sync-pause", { pausedAt: elapsed });
    }
  });

  socket.on("sync-play", ({ currentTime, isPlaying }) => {
    const interval = setInterval(() => {
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(currentTime, true);
        if (isPlaying) playerRef.current.playVideo();
        clearInterval(interval);
      }
    }, 100);
  });

  socket.on("sync-pause", ({ pausedAt }) => {
    const interval = setInterval(() => {
      if (playerRef.current?.seekTo) {
        console.log(`Syncing pause at: ${pausedAt}`);
        playerRef.current.seekTo(pausedAt, true);
        playerRef.current.pauseVideo();
        clearInterval(interval);
      }
    }, 100);
  });
}

module.exports = roomSocketHandlers;
