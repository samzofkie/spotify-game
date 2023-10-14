import React , { StrictMode, useState, useRef, createContext, useContext} from "react";
import { createRoot } from "react-dom/client";


function SongArtwork({artworkUrl, audioRef, playbackSupported}) {
  const {pause, play} = useContext(PlaybackContext);
  const imageRef = useRef();
  const [imageSubText, setImageSubText] = useState('');
  const imageSubTextRef = useRef();
  const handleClick = playbackSupported ?
    () => {
      pause();
      play(audioRef.current);
    } :
    () => {
      imageRef.current.style.opacity = 0.2;
      imageSubTextRef.current.style.opacity = 1;
      setImageSubText('Playback disabled for this song :(');

      setTimeout(() => {
        imageRef.current.style.opacity = 1;
        imageSubTextRef.current.style.opacity = 0;
      }, 1000);

      setTimeout(() => setImageSubText(''), 1750);
    };

  return (
    <div className={'artwork'}>
      <img ref={imageRef} src={artworkUrl} onClick={handleClick} />
      <div ref={imageSubTextRef} className={'artwork-text'}>
        {imageSubText}
      </div>
    </div>
  );
}

function Song({songJson}) {
  const playbackUrl = songJson.playback_url;
 
  const audioRef = useRef();
  const audio = playbackUrl ? 
    <audio ref={audioRef}>
      <source src={playbackUrl} type={'audio/mpeg'} />
    </audio> :
    null;

  return (
    <div className={'song'}>
      {audio}
      <SongArtwork artworkUrl={songJson.artwork_url} audioRef={audioRef} 
        playbackSupported={songJson.playback_url} />
      <div className={'song-info'}>
        <p>{songJson.song_title}</p>
        <p>{songJson.artist}</p>
        <a href={songJson.link_url}>{songJson.link_url}</a>
      </div>
    </div>
  );
}

function App() {
  const [songs, setSongs] = useState([]);

  function fetchSongs() {
    fetch('/songs')
      .then(res => res.json())
      .then(songJsonStrings =>
        songJsonStrings.map((string) => JSON.parse(string))
      )
      .then(songJsons => 
        songJsons.filter((songJson) => Object.keys(songJson).length > 0)
      )
      .then(setSongs)
  }

  return (
    <>
      {songs.map((songJson, i) => <Song songJson={songJson} key={i}/>)}
      <button onClick={fetchSongs}>Load songs</button>
    </>
  );
}

const PlaybackContext = createContext();

function PlaybackProvider({ children }) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState('');

  function pause() {
    if (currentlyPlaying) {
      currentlyPlaying.pause()
      setCurrentlyPlaying('');
    }
  }

  function play(newAudio) {
    newAudio.play();
    setCurrentlyPlaying(newAudio);
  }

  return (
    <PlaybackContext.Provider value={{ pause, play }}>
      {children}
    </PlaybackContext.Provider>
  );
}

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <PlaybackProvider>
      <App />
    </PlaybackProvider>
  </StrictMode>
);
