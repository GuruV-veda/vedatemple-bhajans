import React, { useEffect, useState, useRef } from "react";

import { supabase } from "./supabase";

function App() {

const containerRef = useRef(null);

const [songs, setSongs] = useState([]);
  const song = {
    title: "Sample Bhajan",
    lyrics: `Line 1 of the bhajan
Line 2 of the bhajan
Line 3 of the bhajan`,
    audio: "/audio/sample.mp3"
  };

const [deities, setDeities] = useState([]);
const [tags, setTags] = useState([]);
const [playlists, setPlaylists] = useState([]);

const [selectedSong, setSelectedSong] = useState(null);

const [searchTerm, setSearchTerm] = useState("");
const [selectedDeity, setSelectedDeity] = useState("");
const [selectedTag, setSelectedTag] = useState("");
const [selectedPlaylist, setSelectedPlaylist] = useState("");

const [loading, setLoading] = useState(false);

const [viewLanguage, setViewLanguage] = useState("roman");
const [fontSize, setFontSize] = useState(24);
const [isFullscreen, setIsFullscreen] = useState(false);
  

const [audioSrc, setAudioSrc] = useState("");

const audioRef = useRef(null);

const langShort = {
roman: "RO",
tamil: "TA",
telugu: "TE",
kannada: "KA",
malayalam: "ML",
devanagari: "HI"
};

/* ---------------- Load Initial Data ---------------- */

useEffect(() => {
fetchSongs();
fetchDeities();
fetchPlaylists();
}, []);

/* ---------------- Fetch Deities ---------------- */

const fetchDeities = async () => {
const { data } = await supabase
.from("deities")
.select("id,name")
.order("name");


setDeities(data || []);


};

/* ---------------- Fetch Songs ---------------- */

const fetchSongs = async () => {


setLoading(true);

const { data } = await supabase
  .from("songs")
  .select("*,deities(name)")
  .order("title");

setSongs(data || []);

const allTags = (data || []).flatMap((s) => {
  if (!s.tags) return [];
  if (Array.isArray(s.tags)) return s.tags;
  return s.tags.split(",").map((t) => t.trim());
});

const uniqueTags = [...new Set(allTags)];

setTags(uniqueTags);

setLoading(false);


};

/* ---------------- Fetch Playlists ---------------- */

const fetchPlaylists = async () => {


const { data } = await supabase
  .from("playlists")
  .select("*")
  .order("name");

setPlaylists(data || []);


};

/* ---------------- Playlist Loader ---------------- */

const loadPlaylist = async (playlistId) => {


setSelectedPlaylist(playlistId);

if (!playlistId) {
  fetchSongs();
  return;
}

setLoading(true);

const { data } = await supabase
  .from("playlist_songs")
  .select("songs(*)")
  .eq("playlist_id", playlistId)
  .order("position");

const playlistSongs = data.map((row) => row.songs);

setSongs(playlistSongs);

setLoading(false);


};

/* ---------------- Select Song ---------------- */

const loadSong = (song) => {


setSelectedSong(song);

if (song?.lyrics?.roman) {
  setViewLanguage("roman");
} else {
  const firstLang = Object.keys(song.lyrics || {})[0];
  setViewLanguage(firstLang || "roman");
}

setFontSize(24);

if (song.audio !== audioSrc) {
  setAudioSrc(song.audio || "");
}


};


 // FULLSCREEN TOGGLE
  const toggleFullscreen = () => {

    const elem = containerRef.current;

    if (!document.fullscreenElement) {

      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }

    } else {

      if (document.exitFullscreen) {
        document.exitFullscreen();
      }

    }
  };

// Detect exit from fullscreen
  useEffect(() => {

    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handler);

    return () => {
      document.removeEventListener("fullscreenchange", handler);
    };

  }, []);


/* ---------------- Next / Previous ---------------- */

const nextSong = () => {
const index = songs.findIndex((s) => s.id === selectedSong.id);
const next = songs[index + 1];
if (next) loadSong(next);
};

const prevSong = () => {
const index = songs.findIndex((s) => s.id === selectedSong.id);
const prev = songs[index - 1];
if (prev) loadSong(prev);
};

/* ---------------- Filtering ---------------- */

const filteredSongs = songs
.filter((song) =>
(song.title || "")
.toLowerCase()
.includes(searchTerm.toLowerCase())
)
.filter((song) =>
selectedDeity ? song.deity_id === selectedDeity : true
)
.filter((song) =>
selectedTag ? song.tags?.includes(selectedTag) : true
);

/* ---------------- UI ---------------- */

return ( <div ref={containerRef} style={styles.app}>

  <h1 style={styles.header}>Veda Temple Bhajans</h1>

  <div style={styles.container}>

    {/* Sidebar */}

    <div style={styles.sidebar}>

      <input
        type="text"
        placeholder="Search songs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.input}
      />

      <div style={styles.filterBar}>

        <select
          value={selectedDeity}
          onChange={(e) => setSelectedDeity(e.target.value)}
          style={styles.select}
        >
          <option value="">Deity</option>

          {deities.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}

        </select>

        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          style={styles.select}
        >
          <option value="">Tags</option>

          {tags.map((tag) => (
            <option key={tag}>{tag}</option>
          ))}

        </select>

      </div>

      <select
        value={selectedPlaylist}
        onChange={(e) => loadPlaylist(e.target.value)}
        style={styles.select}
      >
        <option value="">Playlist</option>

        {playlists.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}

      </select>

      <div style={styles.songList}>

        {filteredSongs.map((song) => (

          <div
            key={song.id}
            style={styles.songItem}
            onClick={() => loadSong(song)}
          >

            <div>{song.title}</div>

            <small style={{ color: "#888" }}>
              {song.deities?.name}
            </small>

          </div>

        ))}

      </div>

    </div>

    {/* Content */}

    <div style={styles.content}>

      {loading && <p>Loading songs...</p>}

      {!loading && selectedSong && (

        <>

          <h2>{selectedSong.title}</h2>

          <p>
            <strong>Deity:</strong> {selectedSong.deities?.name}
          </p>

          <div style={styles.languageBar}>

           <button
  onClick={toggleFullscreen}
  style={styles.langButton}
>
  {isFullscreen ? "Exit" : "Full"}
</button>

            {Object.keys(selectedSong.lyrics || {}).map((lang) => (

              <button
                key={lang}
                onClick={() => setViewLanguage(lang)}
                style={{
                  ...styles.langButton,
                  backgroundColor:
                    viewLanguage === lang ? "#444" : "#eee",
                  color:
                    viewLanguage === lang ? "#fff" : "#000",
                }}
              >

                {langShort[lang] || lang}

              </button>

            ))}

            <button
              onClick={() =>
                setFontSize((prev) => Math.max(prev - 2, 16))
              }
              style={styles.langButton}
            >
              A-
            </button>

            <button
              onClick={() =>
                setFontSize((prev) => Math.min(prev + 2, 40))
              }
              style={styles.langButton}
            >
              A+
            </button>

          </div>

          <div style={styles.lyrics}>

            <pre
              style={{
                fontSize: `${fontSize}px`,
                whiteSpace: "pre-wrap",
              }}
            >

              {selectedSong.lyrics?.[viewLanguage] ||
                "Lyrics not available"}

            </pre>

          </div>

          <div style={styles.songNav}>

            <button onClick={prevSong} style={styles.navButton}>
              Previous
            </button>

            <button onClick={nextSong} style={styles.navButton}>
              Next
            </button>

          </div>

        </>

      )}

      {!loading && !selectedSong && (
        <p>Select a song to view details.</p>
      )}

    </div>

  </div>

  {/* Sticky Audio Player */}

  {audioSrc && (

    <div style={styles.audioBar}>

      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
        {selectedSong?.title}
      </div>

      <audio
        ref={audioRef}
        controls
        src={audioSrc}
        style={{ width: "100%" }}
      />

    </div>

  )}


  

</div>

);
}

/* ---------------- Styles ---------------- */

const styles = {

app: {
fontFamily: "Arial",
padding: "15px",
paddingBottom: "120px"
},

header: {
textAlign: "center",
marginBottom: "15px"
},

container: {
display: "flex",
flexDirection: "column",
gap: "15px"
},

sidebar: {},

content: {},

input: {
width: "100%",
padding: "10px",
marginBottom: "10px"
},

filterBar: {
display: "flex",
gap: "8px",
marginBottom: "10px"
},

select: {
flex: 1,
padding: "10px"
},

songList: {
maxHeight: "50vh",
overflowY: "auto",
border: "1px solid #ddd",
padding: "10px"
},

songItem: {
padding: "10px",
borderBottom: "1px solid #eee",
cursor: "pointer"
},

languageBar: {
display: "flex",
flexWrap: "wrap",
gap: "8px",
margin: "10px 0"
},

langButton: {
padding: "12px 16px",
border: "none",
cursor: "pointer",
borderRadius: "20px",
fontSize: "16px"
},

lyrics: {
background: "#5616f5",
padding: "20px",
borderRadius: "10px",
color: "white",
lineHeight: "1.8",
maxHeight: "50vh",
overflowY: "auto"
},

songNav: {
display: "flex",
justifyContent: "space-between",
marginTop: "10px"
},

navButton: {
padding: "10px 20px",
borderRadius: "8px",
border: "none",
cursor: "pointer"
},

audioBar: {
position: "fixed",
bottom: 0,
left: 0,
right: 0,
background: "white",
padding: "10px",
borderTop: "1px solid #ddd",
zIndex: 1000
}

};

export default App;
