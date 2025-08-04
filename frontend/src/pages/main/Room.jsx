import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../../context/SocketContext";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useAddMusicToQueueMutation,
  useGetRoomInfoQuery,
} from "../../redux/apiSlice";

function Room() {
  const user = useSelector((state) => state.auth);
  const socket = useContext(SocketContext);
  const playerRef = useRef(null);
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState(null);
  const { roomId } = useParams();

  const [addMusicToQueue] = useAddMusicToQueueMutation();
  const { data: roomInfo, isLoading, isError } = useGetRoomInfoQuery(roomId);

  useEffect(() => {
    if (videoId) {
      const loadPlayer = () => {
        playerRef.current = new window.YT.Player("player", {
          videoId,
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
          },
        });
      };

      if (!window.YT) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = loadPlayer;
      } else {
        loadPlayer();
      }
    }
  }, [videoId]);

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("sync-play", ({ currentTime }) => {
      if (playerRef.current) {
        playerRef.current.seekTo(currentTime, true);
        playerRef.current.playVideo();
      }
    });

    socket.on("sync-pause", ({ pausedAt }) => {
      if (playerRef.current) {
        playerRef.current.pauseVideo();
      }
    });

    socket.on("load-video", ({ roomId, video }) => {
      if (video?.url) {
        const extractedId = extractVideoId(video.url);
        console.log("Loaded video:", video);
        if (extractedId) setVideoId(extractedId);
      }
    });

    return () => {
      socket.off("sync-play");
      socket.off("load-video");
    };
  }, [socket, roomId]);

  // Load the current song from room info
  useEffect(() => {
    if (roomInfo?.currentSong?.url) {
      const id = extractVideoId(roomInfo.currentSong.url);
      if (id) setVideoId(id);
    }
  }, [roomInfo]);

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
  };

  const onPlaybackRateChange = () => {
    const currentTime = playerRef.current?.getCurrentTime();
    if (Math.abs(currentTime - lastSyncedTime) > 2) {
      playerRef.current.seekTo(lastSyncedTime, true);
    }
  };

  const onPlayerStateChange = (event) => {
    const state = event.data;

    if (state === window.YT.PlayerState.PLAYING) {
      socket.emit("play-video", { roomId });
    }

    if (state === window.YT.PlayerState.PAUSED) {
      console.log("Video paused");
      socket.emit("pause-video", { roomId });
    }
  };

  const extractVideoId = (youtubeUrl) => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = youtubeUrl.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const handleLoadVideo = async () => {
    const id = extractVideoId(url);
    if (id) {
      const title = `Video ${id}`;
      const thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

      try {
        const res = await addMusicToQueue({
          roomId,
          userId: user?.profile?._id,
          title,
          url,
          thumbnail,
        }).unwrap();
        console.log("Music added to queue:", res);

        setVideoId(id);

        socket.emit("load-video", {
          roomId,
          video: {
            title,
            url,
            thumbnail,
            addedBy: user?.profile?._id,
          },
        });
      } catch (err) {
        console.error("Failed to add music to queue:", err);
        alert("Could not add video to queue.");
      }
    } else {
      alert("Invalid YouTube URL");
    }
  };

  if (isLoading) return <p>Loading room info...</p>;
  if (isError) return <p>Failed to load room info.</p>;

  return (
    <div>
      <h1>Room Page</h1>

      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <button onClick={handleLoadVideo}>Load Video</button>

      <div style={{ marginTop: "20px" }}>
        {videoId && (
          <div id="player" style={{ width: "640px", height: "360px" }} />
        )}
      </div>
    </div>
  );
}

export default Room;
