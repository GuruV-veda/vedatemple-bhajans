import { useEffect, useState } from "react";

function App() {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    fetch("/bhajans/library.json")
      .then(res => res.json())
      .then(data => setSongs(data.songs));
  }, []);

  if (selectedSong) {
    return <SongView song={selectedSong} goBack={() => setSelectedSong(null)} />;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Veda Temple Bhajans</h1>
      {songs.map(song => (
        <div key={song.id} onClick={() => setSelectedSong(song)}>
          {song.title}
        </div>
      ))}
    </div>
  );
}

function SongView({ song, goBack }) {
  const [lyrics, setLyrics] = useState([]);

  useEffect(() => {
    fetch(`/bhajans/songs/${song.file}`)
      .then(res => res.json())
      .then(data => setLyrics(data.lyrics));
  }, [song]);

  return (
    <div style={{ padding: 20 }}>
      <button onClick={goBack}>Back</button>
      <h2>{song.title}</h2>
      {lyrics.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
    </div>
  );
}

export default App;