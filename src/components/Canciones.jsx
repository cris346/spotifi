import { useState, useEffect, useRef } from "react"
import { supabase } from "../apis/cliente"

export default function Canciones({ session, onNavigate }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }
  const [canciones, setCanciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [actual, setActual] = useState(null)       // canción activa
  const [reproduciendo, setReproduciendo] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [volumen, setVolumen] = useState(0.8)
  const [tiempoActual, setTiempoActual] = useState("0:00")
  const [duracionTotal, setDuracionTotal] = useState("0:00")
  const audioRef = useRef(null)

  useEffect(() => {
    fetchCanciones()
  }, [])

  const fetchCanciones = async () => {
    const { data, error } = await supabase
      .from("Canciones")
      .select(`
        cancion_id,
        titulo,
        duracion,
        url_audio,
        Albumes (
          titulo,
          Artistas ( nombre )
        ),
        Generos ( nombre )
      `)
      .order("cancion_id")

    if (!error) setCanciones(data || [])
    setLoading(false)
  }

  // ── Audio controls ──────────────────────────────
  const reproducir = (cancion) => {
    if (actual?.cancion_id === cancion.cancion_id) {
      togglePlay()
      return
    }
    setActual(cancion)
    setReproduciendo(true)
    setProgreso(0)
  }

  useEffect(() => {
    if (!audioRef.current || !actual) return
    audioRef.current.src = actual.url_audio
    audioRef.current.volume = volumen
    audioRef.current.play().catch(() => { })
  }, [actual])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (reproduciendo) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setReproduciendo(!reproduciendo)
  }

  const onTimeUpdate = () => {
    const a = audioRef.current
    if (!a) return
    const pct = (a.currentTime / a.duration) * 100 || 0
    setProgreso(pct)
    setTiempoActual(formatTime(a.currentTime))
    setDuracionTotal(formatTime(a.duration))
  }

  const onSeek = (e) => {
    const a = audioRef.current
    if (!a) return
    const pct = e.target.value
    a.currentTime = (pct / 100) * a.duration
    setProgreso(pct)
  }

  const onVolumen = (e) => {
    const v = parseFloat(e.target.value)
    setVolumen(v)
    if (audioRef.current) audioRef.current.volume = v
  }

  const siguiente = () => {
    const idx = canciones.findIndex(c => c.cancion_id === actual?.cancion_id)
    const next = canciones[(idx + 1) % canciones.length]
    setActual(next)
    setReproduciendo(true)
  }

  const anterior = () => {
    const idx = canciones.findIndex(c => c.cancion_id === actual?.cancion_id)
    const prev = canciones[(idx - 1 + canciones.length) % canciones.length]
    setActual(prev)
    setReproduciendo(true)
  }

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00"
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60).toString().padStart(2, "0")
    return `${m}:${sec}`
  }

  const getColor = (genero) => {
    const map = {
      "Pop": "#f472b6", "Rock": "#f97316", "Hip-Hop": "#a78bfa",
      "Reggaeton": "#facc15", "Jazz": "#60a5fa", "Electronic": "#34d399",
      "R&B": "#fb7185", "Latin": "#fb923c",
    }
    return map[genero] || "#1DB954"
  }

  // ── Render ──────────────────────────────────────
  return (
    <div style={s.page}>
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onEnded={siguiente}
      />

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          {/* Botón volver */}
          {onNavigate && (
            <button style={s.backBtn} onClick={() => onNavigate('home')}>
              ← Inicio
            </button>
          )}

          <svg width="28" height="28" viewBox="0 0 38 38" fill="none">
            <circle cx="19" cy="19" r="19" fill="#1DB954" />
            <path d="M27 14c-4-2-10-2-15 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M26 19c-3.5-1.5-8.5-1.5-13 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M25 24c-3-1-7-1-10.5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span style={s.logoText}>Spotifi</span>
        </div>
        <h1 style={s.pageTitle}>Canciones</h1>
        <span style={s.count}>{canciones.length} canciones</span>
        <button style={s.logoutBtn} onClick={handleLogout}>Cerrar sesión</button>
      </div>

      {/* Lista */}
      <div style={s.lista}>
        {loading ? (
          <div style={s.spinnerWrap}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Cargando canciones...</p>
          </div>
        ) : (
          canciones.map((c, i) => {
            const isActive = actual?.cancion_id === c.cancion_id
            const artista = c.Albumes?.Artistas?.nombre || "Desconocido"
            const album = c.Albumes?.titulo || "Sin álbum"
            const genero = c.Generos?.nombre || ""
            const color = getColor(genero)

            return (
              <div
                key={c.cancion_id}
                style={{
                  ...s.row,
                  background: isActive ? "rgba(29,185,84,0.08)" : "transparent",
                  borderLeft: isActive ? `3px solid #1DB954` : "3px solid transparent",
                }}
                onClick={() => reproducir(c)}
              >
                {/* Número / play */}
                <div style={s.rowNum}>
                  {isActive && reproduciendo ? (
                    <BarsIcon color="#1DB954" />
                  ) : (
                    <span style={{ color: isActive ? "#1DB954" : "#555", fontSize: 13 }}>
                      {i + 1}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={s.rowInfo}>
                  <span style={{ ...s.rowTitulo, color: isActive ? "#1DB954" : "#fff" }}>
                    {c.titulo}
                  </span>
                  <span style={s.rowSub}>{artista} · {album}</span>
                </div>

                {/* Género */}
                <span style={{ ...s.badge, background: color + "22", color }}>
                  {genero}
                </span>

                {/* Duración */}
                <span style={s.duracion}>{c.duracion?.slice(0, 5)}</span>
              </div>
            )
          })
        )}
      </div>

      {/* Player */}
      {actual && (
        <div style={s.player}>
          {/* Info canción actual */}
          <div style={s.playerInfo}>
            <div style={{ ...s.disc, background: getColor(actual.Generos?.nombre) + "33" }}>
              🎵
            </div>
            <div>
              <p style={s.playerTitulo}>{actual.titulo}</p>
              <p style={s.playerArtista}>{actual.Albumes?.Artistas?.nombre}</p>
            </div>
          </div>

          {/* Controles */}
          <div style={s.playerCenter}>
            <div style={s.controls}>
              <button style={s.ctrlBtn} onClick={anterior}>⏮</button>
              <button style={s.playBtn} onClick={togglePlay}>
                {reproduciendo ? "⏸" : "▶"}
              </button>
              <button style={s.ctrlBtn} onClick={siguiente}>⏭</button>
            </div>
            <div style={s.progressWrap}>
              <span style={s.timeLabel}>{tiempoActual}</span>
              <input
                type="range" min="0" max="100"
                value={progreso}
                onChange={onSeek}
                style={s.slider}
              />
              <span style={s.timeLabel}>{duracionTotal}</span>
            </div>
          </div>

          {/* Volumen */}
          <div style={s.volWrap}>
            <span style={s.volIcon}>{volumen === 0 ? "🔇" : volumen < 0.5 ? "🔉" : "🔊"}</span>
            <input
              type="range" min="0" max="1" step="0.01"
              value={volumen}
              onChange={onVolumen}
              style={{ ...s.slider, width: 80 }}
            />
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bars {
          0%, 100% { height: 6px; }
          50%       { height: 14px; }
        }
        input[type=range] { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; }
        input[type=range]::-webkit-slider-runnable-track {
          height: 3px; border-radius: 2px; background: #333;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 12px; height: 12px;
          border-radius: 50%; background: #1DB954; margin-top: -4.5px;
        }
        div[style*="transparent"]:hover {
          background: rgba(255,255,255,0.03) !important;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

// Ícono de barras animadas (reproduciendo)
function BarsIcon({ color }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 16 }}>
      {[0, 0.2, 0.4].map((delay, i) => (
        <div key={i} style={{
          width: 3, background: color, borderRadius: 2,
          animation: `bars 0.8s ease-in-out ${delay}s infinite`,
          height: 10,
        }} />
      ))}
    </div>
  )
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    fontFamily: "'DM Sans', sans-serif",
    paddingBottom: 100,
    color: "#fff",
  },
  header: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "28px 32px 20px",
    borderBottom: "1px solid #1a1a1a",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  backBtn: {
    background: "transparent",
    border: "1px solid #333",
    color: "#888",
    fontSize: 13,
    padding: "6px 14px",
    borderRadius: 20,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  logoText: { fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#fff" },
  pageTitle: { fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", flex: 1 },
  count: { fontSize: 13, color: "#555" },
  logoutBtn: {
    background: "transparent", border: "1px solid #333",
    color: "#888", fontSize: 12, padding: "6px 14px",
    borderRadius: 20, cursor: "pointer",
  },

  lista: { padding: "8px 0" },

  spinnerWrap: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: 80, gap: 16,
  },
  spinner: {
    width: 36, height: 36, borderRadius: "50%",
    border: "3px solid #1a1a1a", borderTop: "3px solid #1DB954",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#555", fontSize: 14 },

  row: {
    display: "flex", alignItems: "center",
    padding: "10px 32px", gap: 16,
    transition: "background 0.15s",
    animation: "fadeUp 0.3s ease both",
  },
  rowNum: { width: 24, display: "flex", justifyContent: "center" },
  rowInfo: { flex: 1, minWidth: 0 },
  rowTitulo: { fontSize: 15, fontWeight: 500, display: "block", transition: "color 0.2s" },
  rowSub: { fontSize: 12, color: "#666", marginTop: 2, display: "block" },
  badge: {
    fontSize: 11, fontWeight: 600, padding: "3px 10px",
    borderRadius: 20, whiteSpace: "nowrap",
  },
  duracion: { fontSize: 13, color: "#555", width: 40, textAlign: "right" },

  // Player
  player: {
    position: "fixed", bottom: 0, left: 0, right: 0,
    height: 88,
    background: "rgba(10,10,10,0.95)",
    backdropFilter: "blur(20px)",
    borderTop: "1px solid #1a1a1a",
    display: "flex", alignItems: "center",
    padding: "0 28px", gap: 20,
    zIndex: 100,
  },
  playerInfo: {
    display: "flex", alignItems: "center", gap: 12,
    minWidth: 200, flex: 1,
  },
  disc: {
    width: 44, height: 44, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, flexShrink: 0,
  },
  playerTitulo: { fontSize: 14, fontWeight: 600, color: "#fff" },
  playerArtista: { fontSize: 12, color: "#888", marginTop: 2 },

  playerCenter: {
    flex: 2, display: "flex", flexDirection: "column",
    alignItems: "center", gap: 6,
  },
  controls: { display: "flex", alignItems: "center", gap: 16 },
  ctrlBtn: {
    background: "none", border: "none", color: "#aaa",
    fontSize: 18, cursor: "pointer", padding: 4,
    transition: "color 0.15s",
  },
  playBtn: {
    width: 40, height: 40, borderRadius: "50%",
    background: "#1DB954", border: "none",
    color: "#000", fontSize: 16, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, transition: "transform 0.15s",
  },
  progressWrap: {
    display: "flex", alignItems: "center", gap: 8, width: "100%",
  },
  timeLabel: { fontSize: 11, color: "#555", width: 32, textAlign: "center" },
  slider: { flex: 1, height: 3 },

  volWrap: {
    display: "flex", alignItems: "center", gap: 8,
    flex: 1, justifyContent: "flex-end",
  },
  volIcon: { fontSize: 16 },
}