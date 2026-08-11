import { useEffect, useRef, useState } from "react";
import "./App.css";

const PLAYLIST_ID = "PLMRKdK25AuPVjHl9Kdb-gkBy0Cm7Zi2xo";

function App() {
  const playerRef = useRef(null);
  const progressTimer = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const [songTitle, setSongTitle] = useState("Loading...");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Live Clock
  const [currentClock, setCurrentClock] = useState(new Date());

  // =========================
  // LIVE CLOCK
  // =========================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentClock(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // =========================
  // YOUTUBE PLAYER
  // =========================

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }

    const script = document.createElement("script");

    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;

    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = createPlayer;

    function createPlayer() {
      playerRef.current = new window.YT.Player("youtube-player", {
        height: "1",
        width: "1",

        playerVars: {
          listType: "playlist",
          list: PLAYLIST_ID,
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
        },

        events: {
          onReady: () => {
            setReady(true);

            const title = playerRef.current.getVideoData().title;

            if (title) {
              setSongTitle(title);
            }

            setDuration(playerRef.current.getDuration());
          },

          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);

              startProgress();
            }

            if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              setIsPlaying(false);

              stopProgress();
            }

            updateSongInfo();
          },
        },
      });
    }

    function startProgress() {
      stopProgress();

      progressTimer.current = setInterval(() => {
        if (!playerRef.current) return;

        setCurrentTime(playerRef.current.getCurrentTime());
        setDuration(playerRef.current.getDuration());

        updateSongInfo();
      }, 500);
    }

    function stopProgress() {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    }

    function updateSongInfo() {
      if (!playerRef.current) return;

      const data = playerRef.current.getVideoData();

      if (data?.title) {
        setSongTitle(data.title);
      }
    }

    return () => {
      stopProgress();
    };
  }, []);

  // =========================
  // PLAY / PAUSE
  // =========================

  const playPause = () => {
    if (!ready) return;

    const state = playerRef.current.getPlayerState();

    if (state === window.YT.PlayerState.PLAYING) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  // =========================
  // NEXT SONG
  // =========================

  const nextSong = () => {
    if (!ready) return;

    playerRef.current.nextVideo();

    setTimeout(() => {
      const data = playerRef.current.getVideoData();

      if (data?.title) {
        setSongTitle(data.title);
      }

      setCurrentTime(0);
    }, 500);
  };

  // =========================
  // PREVIOUS SONG
  // =========================

  const previousSong = () => {
    if (!ready) return;

    playerRef.current.previousVideo();

    setTimeout(() => {
      const data = playerRef.current.getVideoData();

      if (data?.title) {
        setSongTitle(data.title);
      }

      setCurrentTime(0);
    }, 500);
  };

  // =========================
  // PROGRESS BAR
  // =========================

  const changeProgress = (e) => {
    if (!ready || !duration) return;

    const newTime = Number(e.target.value);

    playerRef.current.seekTo(newTime, true);

    setCurrentTime(newTime);
  };

  // =========================
  // FORMAT TIME
  // =========================

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // =========================
  // CLOCK FORMAT
  // =========================

  const clockTime = currentClock.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="screen">

      {/* Brand */}

      <div className="brand">
        <span>AUTO</span> NIGHT
      </div>

      {/* Live Clock */}

      <div className="clock">
        {clockTime}
      </div>

      {/* Glow */}

      <div className="auto-glow"></div>

      {/* Auto */}

      <img
        src="/images/auto.png"
        alt="Auto Rickshaw"
        className="auto"
      />

      {/* YouTube Player */}

      <div
        id="youtube-player"
        className="youtube-player"
      ></div>

      {/* Music Player */}

      <div className="music-player">

        {/* Song Information */}

        <div className="song-info">

          <div className="music-icon">
            ♪
          </div>

          <div className="song-details">

            <div className="song-title">
              {songTitle}
            </div>

            <div className="song-status">
              {isPlaying ? "Playing" : "Paused"}
            </div>

          </div>

        </div>

        {/* Progress */}

        <div className="progress-container">

          <span>
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={changeProgress}
            className="progress"
          />

          <span>
            {formatTime(duration)}
          </span>

        </div>

        {/* Controls */}

        <div className="controls">

          <button
            className="control-btn"
            onClick={previousSong}
          >
            ⏮
          </button>

          <button
            className="play"
            onClick={playPause}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            className="control-btn"
            onClick={nextSong}
          >
            ⏭
          </button>

        </div>

      </div>

    </div>
  );
}

export default App;