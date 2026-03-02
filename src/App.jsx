import React, { useEffect, useState } from "react";

function App() {
  const [library, setLibrary] = useState([]);
  const [deities, setDeities] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeity, setSelectedDeity] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewLanguage, setViewLanguage] = useState("Roman");

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
      setViewLanguage("Roman"); // reset to default on new song
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
                <small style={{ color: "#888" }}>{song.deity}</small>
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
              <p><strong>Deity:</strong> {selectedSong.deity}</p>

              {/* Audio */}
              {selectedSong.audio && (
                <audio
                  controls
                  src={`/bhajans/audio/${selectedSong.id}.mp3`}
                  style={{ margin: "15px 0", width: "100%" }}
                />
              )}

              {/* Language Selector */}
              <div style={styles.languageBar}>
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
              </div>

              {/* Lyrics */}
              <div style={styles.lyrics}>
                <pre>{selectedSong.lyrics[viewLanguage]}</pre>
              </div>
            </>
          )}

          {!loading && !selectedSong && (
            <p>Select a song to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}

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
    padding: "15px",
    whiteSpace: "pre-wrap",
    borderRadius: "6px",
  },
};

export default App;