import React, { useEffect, useState } from "react";

function App() {
  const [library, setLibrary] = useState([]);
  const [deities, setDeities] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeity, setSelectedDeity] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewLanguage, setViewLanguage] = useState("Roman");
  const [fontSize, setFontSize] = useState(20);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetch("/library.json")
      .then((res) => res.json())
      .then((data) => {
        setLibrary(data.songs || []);
        setDeities(data.deities || []);
      })
      .catch((err) => console.error("Error loading library:", err));
  }, []);

  const loadSong = async (slug) => {
    try {
      setLoading(true);
      const res = await fetch(`/bhajans/songs/${slug}.json`);
      const data = await res.json();
      setSelectedSong(data);
      setViewLanguage("Roman");
      setFontSize(20);
      setLoading(false);
    } catch (error) {
      console.error("Error loading song:", error);
      setLoading(false);
    }
  };

  const filteredSongs = library
    .filter((song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((song) =>
      selectedDeity ? song.deity === selectedDeity : true
    );
  

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
              margin: 0,
              whiteSpace: "pre-wrap"
            }}
          >
            {selectedSong.lyrics[viewLanguage]}
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
            <input
              type="text"
              placeholder="Search songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.input}
            />

            <select
              value={selectedDeity}
              onChange={(e) => setSelectedDeity(e.target.value)}
              style={styles.select}
            >
              <option value="">All Deities</option>
              {deities.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <div style={styles.songList}>
              {filteredSongs.map((song) => (
                <div
                  key={song.id}
                  style={styles.songItem}
                  onClick={() => loadSong(song.id)}
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
            {loading && <p>Loading song...</p>}

            {!loading && selectedSong && (
              <>
                <h2>{selectedSong.title}</h2>
                <p>
                  <strong>Deity:</strong> {selectedSong.deity}
                </p>

                {selectedSong.audio && (
                  <audio
                    controls
                    src={`/bhajans/audio/${selectedSong.id}.mp3`}
                    style={{ margin: "15px 0", width: "100%" }}
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

                  {Object.keys(selectedSong.lyrics).map((lang) => (
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
                      margin: 0,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedSong.lyrics[viewLanguage]}
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
};

/* ---------- Styles ---------- */

const styles = {
  app: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  container: {
    display: "flex",
    gap: "20px",
  },
  sidebar: {
    width: "30%",
    minWidth: "250px",
  },
  content: {
    width: "70%",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
  },
  select: {
    width: "100%",
    padding: "8px",
    marginBottom: "15px",
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
    padding: "6px 12px",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
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
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
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
  fontWeight: "bold"
},

fullscreenLyrics: {
  marginTop: "30px",
  lineHeight: "2",
},

};

export default App;