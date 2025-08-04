import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateRoomMutation,
  useJoinRoomMutation,
} from "../../redux/apiSlice";
import { useSelector } from "react-redux";

const Home = () => {
  const [option, setOption] = useState("");
  const [roomId, setRoomId] = useState("");
  const userId = useSelector((state) => state.auth?.profile?._id);
  console.log(userId);
  console.log("Room ID:", roomId);

  const navigate = useNavigate();
  const [createRoom, { isLoading: creating }] = useCreateRoomMutation();
  const [joinRoom, { isLoading: joining }] = useJoinRoomMutation();

  const handleJoinClick = () => {
    setOption("Join");
  };

  const handleCreateClick = async () => {
    setOption("Create");
    try {
      const res = await createRoom({ userId }).unwrap();
      navigate(`/room/${res.room._id}`);
    } catch (err) {
      alert(err?.data?.message || "Failed to create room.");
    }
  };

  const handleRoomJoin = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      return alert("Please enter a valid Room ID");
    }

    try {
      const res = await joinRoom({ userId, roomId }).unwrap();
      navigate(`/room/${roomId}`);
    } catch (err) {
      alert(err?.data?.message || "Failed to join room.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4">
      <div className="w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] text-center">
        <div className="flex flex-col items-center">
          <p className="font-['Kanit'] text-4xl sm:text-5xl md:text-6xl tracking-widest font-bold">
            JOIN OR CREATE A ROOM !!
          </p>

          <div className="flex flex-col sm:flex-row gap-5 mt-6">
            <button
              onClick={handleJoinClick}
              className="text-black font-['Kanit'] font-medium text-xl sm:text-2xl bg-red-500 px-6 py-4 border-4 border-r-8 cursor-pointer hover:bg-red-600"
            >
              Join a room
            </button>
            <button
              onClick={handleCreateClick}
              className="text-black font-['Kanit'] font-medium text-xl sm:text-2xl bg-blue-500 px-6 py-4 border-4 border-r-8 cursor-pointer hover:bg-blue-600"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create a room"}
            </button>
          </div>

          {option === "Join" && (
            <div className="mt-5">
              <form onSubmit={handleRoomJoin}>
                <p className="text-lg font-['Kanit'] font-semibold">
                  Enter Room ID
                </p>
                <input
                  type="text"
                  placeholder="Room Code"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="font-['Kanit'] rounded-none p-2 border-2 border-r-4 placeholder:text-lg mt-2 bg-white placeholder:font-semibold"
                />
                <button
                  type="submit"
                  className="mt-4 ml-3 font-['Kanit'] font-semibold bg-green-500 px-6 py-2 border-2 border-r-4 cursor-pointer hover:bg-green-600"
                  disabled={joining}
                >
                  {joining ? "Joining..." : "Join Room"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
