const express = require("express");
const {
  createRoom,
  joinRoom,
  addMusicToQueue,
  getRoomInfo,
} = require("../controllers/roomControllers");

const router = express.Router();
router.post("/create", createRoom);
router.post("/join/:roomId", joinRoom);
router.post("/add-music/:roomId", addMusicToQueue);
router.get("/info/:roomId", getRoomInfo);

module.exports = router;
