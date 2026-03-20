import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";
import { Analytics } from "@vercel/analytics/react"

function App() {

const containerRef = useRef(null);
const audioRef = useRef(null);

const [songs, setSongs] = useState([]);
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

const langShort = {
roman: "ROM",
tamil: "TAM",
telugu: "TEL",
kannada: "KAN",
malayalam: "MAL",
devanagari: "SANS"
};
const lyricsRef = useRef(null);

/* Load Initial Data */

useEffect(() => {
fetchSongs();
fetchDeities();
fetchPlaylists();
}, []);

/* Prevent Copy / Right Click */
useEffect(() => {

  const preventCopy = (e) => {
    e.preventDefault();
  };

  document.addEventListener("copy", preventCopy);
  document.addEventListener("cut", preventCopy);
  document.addEventListener("contextmenu", preventCopy);

  return () => {
    document.removeEventListener("copy", preventCopy);
    document.removeEventListener("cut", preventCopy);
    document.removeEventListener("contextmenu", preventCopy);
  };

}, []);

/# Scross Lyrics */
useEffect(() => {
  if (selectedSong && lyricsRef.current) {
    lyricsRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}, [selectedSong]);


/* Fetch Deities */

const fetchDeities = async () => {
const { data } = await supabase
.from("deities")
.select("id,name")
.order("name");

setDeities(data || []);
};

/* Fetch Songs */

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

/* Fetch Playlists */

const fetchPlaylists = async () => {

const { data } = await supabase
.from("playlists")
.select("*")
.order("name");

setPlaylists(data || []);
};

/* Playlist Loader */

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

/* Select Song */

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

/* Next / Previous */

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

/* Filtering */

const filteredSongs = songs
.filter((song) =>
(song.title || "").toLowerCase().includes(searchTerm.toLowerCase())
)
.filter((song) =>
selectedDeity ? song.deity_id === selectedDeity : true
)
.filter((song) =>
selectedTag ? song.tags?.includes(selectedTag) : true
);





/* UI */

return (

<div ref={containerRef} style={styles.app}>

{/* Header with Logo */}

<div style={styles.headerBar}>

<img
src="/vedalogo.png"
alt="Vedatemple"
style={styles.logo}
/>

<h1 style={styles.header}>Veda Temple Bhajans</h1>

</div>

<div style={isFullscreen ? styles.containerFullscreen : styles.container}>

{/* Sidebar */}

{!isFullscreen && (

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

<div style={{fontWeight:"bold", color: "#120ef8" }}>{song.title}</div>

<small style={{font:"16px TimesNewRoman", color: "#ce5555", fontStyle: "italic",marginTop: "4px", display: "block" }}>
{song.deities?.name}
</small>

</div>

))}

</div>

</div>

)}

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
onClick={() => {
setIsFullscreen(!isFullscreen);
if (!isFullscreen) setFontSize(42);
}}
style={styles.langButton}
>

{isFullscreen ? "Exit Full" : "Full"}

</button>

{Object.keys(selectedSong.lyrics || {}).map((lang) => (

<button
key={lang}
onClick={() => setViewLanguage(lang)}
style={{
...styles.langButton,
backgroundColor:
viewLanguage === lang ? "#444" : "#ea580c",
color:
viewLanguage === lang ? "#fff" : "#fff"
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

{/* Lyrics Card */}

<div
ref={lyricsRef}
style={{
...styles.lyricsCard,
maxHeight: isFullscreen ? "80vh" : "50vh"
}}
>

<pre
style={{
fontSize: `${fontSize}px`,
whiteSpace: "pre-wrap",
lineHeight: isFullscreen ? "2.2" : "1.8"
}}
>

{selectedSong.lyrics?.[viewLanguage] ||
"Lyrics not available"}

</pre>

</div>

{!isFullscreen && (

<div style={styles.songNav}>

<button onClick={prevSong} style={styles.navButton}>
Previous
</button>

<button onClick={nextSong} style={styles.navButton}>
Next
</button>

</div>

)}

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

<Analytics />

</div>

);
}




/* Existing _ Styles */

const styles = {

app: {
fontFamily: "Arial",
padding: "15px",
paddingBottom: "120px",
background: "linear-gradient(180deg,#fff7ed,#fde68a)",
minHeight: "100vh"
},

headerBar: {
display: "flex",
alignItems: "center",
justifyContent: "center",
gap: "12px",
marginBottom: "15px"
},

logo: {
height: "55px"
},

header: {
textAlign: "center",
marginBottom: "15px",
color: "#220cea"
},

container: {
display: "flex",
flexDirection: "column",
gap: "15px"
},

containerFullscreen: {
display: "block"
},

sidebar: {},

content: {},

input: {
width: "90%",
padding: "10px",
marginBottom: "20px",
height: "40px"
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
border: "1px solid #fde68a",
padding: "10px",
borderRadius: "10px",
background:"blue-50",
},

songItem: {
padding: "12px",
borderBottom: "1px solid #f3f3f3",
cursor: "pointer",
borderRadius: "6px"
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

lyricsCard: {
background: "white",
padding: "22px",
borderRadius: "14px",
color: "#333",
lineHeight: "1.9",
overflowY: "auto",
boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
border: "2px solid #fde68a",

userSelect: "none",
WebkitUserSelect: "none",
MozUserSelect: "none",
msUserSelect: "none",
WebkitTouchCallout: "none"
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
