import { useState, useEffect } from "react"
import { supabase } from "../apis/cliente"
import "./style/Home.css"

export default function Home({ session, onNavigate }) {
  const [usuario, setUsuario] = useState(null)
  const [stats, setStats] = useState({ canciones: 0, albumes: 0, artistas: 0 })
  const [topCanciones, setTopCanciones] = useState([])
  const [generosPopulares, setGenerosPopulares] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const { data: userData } = await supabase
      .from("Usuarios")
      .select("*")
      .eq("email", session.user.email)
      .single()

    setUsuario(userData)

    const { count: totalCanciones } = await supabase
      .from("Canciones")
      .select("*", { count: "exact", head: true })

    const { count: totalAlbumes } = await supabase
      .from("Albumes")
      .select("*", { count: "exact", head: true })

    const { count: totalArtistas } = await supabase
      .from("Artistas")
      .select("*", { count: "exact", head: true })

    setStats({
      canciones: totalCanciones || 0,
      albumes: totalAlbumes || 0,
      artistas: totalArtistas || 0
    })

    const { data: canciones } = await supabase
      .from("Canciones")
      .select(`
        cancion_id,
        titulo,
        Albumes (
          titulo,
          Artistas ( nombre )
        ),
        Generos ( nombre )
      `)
      .limit(6)

    setTopCanciones(canciones || [])

    const { data: generos } = await supabase
      .from("Generos")
      .select("*")
      .limit(8)

    setGenerosPopulares(generos || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const getGeneroColor = (nombre) => {
    const colores = {
      "Pop": "#f472b6",
      "Rock": "#f97316",
      "Hip-Hop": "#a78bfa",
      "Reggaeton": "#facc15",
      "Jazz": "#60a5fa",
      "Electronic": "#34d399",
      "R&B": "#fb7185",
      "Latin": "#fb923c",
    }
    return colores[nombre] || "#1DB954"
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="home-loading">
        <div className="home-spinner" />
      </div>
    )
  }

  return (
    <div className="home-page">
      {/* Sidebar */}
      <aside className="home-sidebar">
        <div className="sidebar-top">
          {/* Logo */}
          <div className="logo-wrap">
            <img src="/sporifi.png" alt="Spotifi" width="36px" height="36px" />
            <span className="logo-text">Spotifi</span>
          </div>

          {/* Navegación */}
          <nav className="home-nav">
            <button className="nav-item active">
              <span className="nav-icon">🏠</span>
              Inicio
            </button>
            <button className="nav-item" onClick={() => onNavigate('canciones')}>
              <span className="nav-icon">🎵</span>
              Canciones
            </button>
            <button className="nav-item">
              <span className="nav-icon">📀</span>
              Álbumes
            </button>
            <button className="nav-item">
              <span className="nav-icon">🎤</span>
              Artistas
            </button>
            <button className="nav-item">
              <span className="nav-icon">❤️</span>
              Favoritos
            </button>
          </nav>
        </div>

        {/* Usuario */}
        <div className="user-card">
          <div className="user-avatar">
            {getInitials(usuario?.nombre || session.user.email)}
          </div>
          <div className="user-info">
            <p className="user-name">{usuario?.nombre || "Usuario"}</p>
            <p className="user-plan">{usuario?.tipo_suscripcion || "Gratis"}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="home-main">
        {/* Header */}
        <header className="home-header">
          <div>
            <h1 className="home-greeting">
              {getGreeting()}, {usuario?.nombre || session.user.email.split('@')[0]} 👋
            </h1>
            <p className="home-sub-greeting">¿Qué quieres escuchar hoy?</p>
          </div>
        </header>

        {/* Stats cards */}
        <section className="stats-section">
          <div className="stat-card stat-card-green">
            <div className="stat-icon">🎵</div>
            <div>
              <p className="stat-number">{stats.canciones.toLocaleString()}</p>
              <p className="stat-label">Canciones</p>
            </div>
          </div>

          <div className="stat-card stat-card-purple">
            <div className="stat-icon">📀</div>
            <div>
              <p className="stat-number">{stats.albumes.toLocaleString()}</p>
              <p className="stat-label">Álbumes</p>
            </div>
          </div>

          <div className="stat-card stat-card-pink">
            <div className="stat-icon">🎤</div>
            <div>
              <p className="stat-number">{stats.artistas.toLocaleString()}</p>
              <p className="stat-label">Artistas</p>
            </div>
          </div>
        </section>

        {/* Géneros populares */}
        <section className="home-section">
          <h2 className="section-title">Géneros populares</h2>
          <div className="genres-grid">
            {generosPopulares.map((genero) => (
              <div
                key={genero.genero_id}
                className="genre-card"
                style={{
                  background: `linear-gradient(135deg, ${getGeneroColor(genero.nombre)}dd 0%, ${getGeneroColor(genero.nombre)}99 100%)`
                }}
              >
                <span className="genre-name">{genero.nombre}</span>
                <span className="genre-icon">
                  {genero.nombre === "Pop" ? "💖" :
                    genero.nombre === "Rock" ? "🎸" :
                      genero.nombre === "Hip-Hop" ? "🎤" :
                        genero.nombre === "Jazz" ? "🎷" :
                          genero.nombre === "Electronic" ? "🎹" :
                            genero.nombre === "Reggaeton" ? "🔥" : "🎵"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Top canciones */}
        <section className="home-section">
          <div className="section-header">
            <h2 className="section-title">Canciones destacadas</h2>
            <button className="ver-mas-btn" onClick={() => onNavigate('canciones')}>
              Ver todas →
            </button>
          </div>
          <div className="canciones-grid">
            {topCanciones.map((cancion) => (
              <div key={cancion.cancion_id} className="cancion-card">
                <div
                  className="cancion-cover"
                  style={{
                    background: `linear-gradient(135deg, ${getGeneroColor(cancion.Generos?.nombre)}66 0%, ${getGeneroColor(cancion.Generos?.nombre)}33 100%)`
                  }}
                >
                  <span className="cover-icon">🎵</span>
                  <div className="play-overlay">
                    <div className="play-btn">▶</div>
                  </div>
                </div>
                <div className="cancion-info">
                  <p className="cancion-titulo">{cancion.titulo}</p>
                  <p className="cancion-artista">
                    {cancion.Albumes?.Artistas?.nombre || "Desconocido"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Banner Premium */}
        <section className="premium-banner">
          <div className="premium-content">
            <div>
              <h3 className="premium-title">🎧 Mejora tu experiencia</h3>
              <p className="premium-desc">
                Accede a funciones exclusivas con Spotifi Premium
              </p>
            </div>
            <button className="premium-btn">
              Actualizar ahora
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Buenos días"
  if (hour < 18) return "Buenas tardes"
  return "Buenas noches"
}
