import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";

function App() {

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

  const [viewLanguage, setViewLanguage] = useState("Roman");
  const [fontSize, setFontSize] = useState(20);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const audioRef = useRef(null);

  /* ---------------- Load Initial Data ---------------- */

 useEffect(() => {
  let isMounted = true;
  const loadInitialData = async () => {
    await fetchSongs();
    await fetchPlaylists();
    await fetchDeities(); 
  };

  loadInitialData();

  return () => {
    isMounted = false;
  };
}, []);

  const fetchDeities = async () => {
  const { data, error } = await supabase
    .from("deities")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Error loading deities:", error);
    return;
  }

  if (!data) return;
  console.log("Deities loaded:", data);
  setDeities(data);
};



  const fetchSongs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .order("title");

    if (error) {
      console.error("Error loading songs:", error);
      setLoading(false);
      return;
    }

    if (!data) return;
    console.log("Songs from DB:", data);
    setSongs(data || []);
    

    /* Extract Deities */
/* Testing with this comment */
    const uniqueDeities = [
      ...new Set((data || []).map((s) => s.deity).filter(Boolean)),
    ];
    setDeities(uniqueDeities);
    /* Extract Tags */

  const allTags = (data || []).flatMap((s) => {
    if (!s.tags) return [];

    if (Array.isArray(s.tags)) return s.tags;
      return s.tags.split(",").map((t) => t.trim());
    });

  const uniqueTags = [...new Set(allTags)];
  setTags(uniqueTags);
    setTags(uniqueTags);

    setLoading(false);
  };

  const fetchPlaylists = async () => {

    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error loading playlists:", error);
      return;
    }

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

    const { data, error } = await supabase
      .from("playlist_songs")
      .select("songs(*)")
      .eq("playlist_id", playlistId)
      .order("position");

    if (error) {
      console.error("Playlist load error:", error);
      setLoading(false);
      return;
    }

    const playlistSongs = data.map((row) => row.songs);

    setSongs(playlistSongs);
    setLoading(false);
  };

  /* ---------------- Select Song ---------------- */

  const loadSong = (song) => {

    setSelectedSong(song);
    setViewLanguage("Roman");
    setFontSize(20);
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

  return (
    <div style={styles.app}>

      {/* FULLSCREEN MODE */}

      {isFullscreen && selectedSong && (
        <div style={styles.fullscreenContainer}>

          <div style={styles.fullscreenHeader}>

            <button
              onClick={() => setIsFullscreen(false)}
              style={styles.fullscreenButton}
            >
              Exit Fullscreen
            </button>

            <button
              onClick={() => {
                setIsFullscreen(false);
                setSelectedSong(null);
              }}
              style={styles.fullscreenButton}
            >
              Home
            </button>

          </div>

          <h2 style={{ marginTop: "20px" }}>
            {selectedSong.title}
          </h2>

          <div style={styles.fullscreenLyrics}>
            <pre
              style={{
                fontSize: `${fontSize + 6}px`,
                whiteSpace: "pre-wrap",
              }}
            >
              {selectedSong.lyrics?.[viewLanguage] ||
                "Lyrics not available"}
            </pre>
          </div>

        </div>
      )}

      {/* NORMAL MODE */}

      {!isFullscreen && (
        <>
          <h1 style={styles.header}>Veda Temple Bhajans</h1>

          <div style={styles.container}>

            {/* Sidebar */}

            <div style={styles.sidebar}>

              {/* Search */}

              <input
                type="text"
                placeholder="Search songs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.input}
              />

              {/* Deity */}

              <select
                value={selectedDeity}
                onChange={(e) => setSelectedDeity(e.target.value)}
                style={styles.select}
              >
                <option value="">All Deities</option>
                {deities.map((d) => (
                <option key={d.id} value={d.id}>
                {d.name}
                </option>
                ))}
               </select>

              {/* Tags */}

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                style={styles.select}
              >
                <option value="">All Tags</option>

                {tags.map((tag) => (
                  <option key={tag}>{tag}</option>
                ))}
              </select>

              {/* Playlists */}

              <select
                value={selectedPlaylist}
                onChange={(e) => loadPlaylist(e.target.value)}
                style={styles.select}
              >
                <option value="">All Songs</option>

                {playlists.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* Song List */}

              <div style={styles.songList}>

                {filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    style={styles.songItem}
                    onClick={() => loadSong(song)}
                  >
                    <div>{song.title}</div>

                    <small style={{ color: "#888" }}>
                      {song.deity}
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

                  {selectedSong.audio && (
                    <audio
                      ref={audioRef}
                      controls
                      src={selectedSong.audio}
                      style={{
                        margin: "15px 0",
                        width: "100%",
                      }}
                    />
                  )}

                  {/* Controls */}

                  <div style={styles.languageBar}>

                    <button
                      onClick={() => setIsFullscreen(true)}
                      style={styles.langButton}
                    >
                      Fullscreen
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
                        {lang}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setFontSize((prev) => Math.max(prev - 2, 14))
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

                </>
              )}

              {!loading && !selectedSong && (
                <p>Select a song to view details.</p>
              )}

            </div>

          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Styles ---------------- */

const styles = {
  app: { fontFamily: "Arial", padding: "20px" },

  header: {
    textAlign: "center",
    marginBottom: "20px",
  },

  container: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },

  sidebar: { flex: "1 1 220px" },

  content: { flex: "2 1 500px" },

  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
  },

  select: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
  },

  songList: {
    maxHeight: "500px",
    overflowY: "auto",
    border: "1px solid #ddd",
    padding: "10px",
  },

  songItem: {
    padding: "8px",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
  },

  languageBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    margin: "15px 0",
  },

  langButton: {
    padding: "10px 16px",
    border: "none",
    cursor: "pointer",
    borderRadius: "20px",
  },

  lyrics: {
    maxHeight: "400px",
    overflowY: "auto",
    background: "#5616f5",
    padding: "20px",
    borderRadius: "10px",
    color: "white",
    lineHeight: "1.8",
  },

  fullscreenContainer: {
    position: "fixed",
    inset: 0,
    backgroundColor: "#5616f5",
    color: "white",
    padding: "30px",
    overflowY: "auto",
    zIndex: 9999,
  },

  fullscreenHeader: {
    display: "flex",
    justifyContent: "space-between",
  },

  fullscreenButton: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },

  fullscreenLyrics: {
    marginTop: "20px",
    lineHeight: "2",
  },
};

export default App;