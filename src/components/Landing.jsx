import { useState } from "react"
import "./style/Landing.css"

export default function Landing({ onIniciar }) {
  const [hoveredFeature, setHoveredFeature] = useState(null)

  return (
    <div className="landing-page">
      {/* Fondo animado */}
      <div className="landing-bg">
        <div className="blob1" />
        <div className="blob2" />
        <div className="blob3" />
      </div>

      {/* Header */}
      <header className="landing-header">
        <div className="logo-wrap">
          <img src="/sporifi.png" alt="Spotifi" width="40px" height="40px" />
          <span className="logo-text">Spotifi</span>
        </div>
        <button className="btn-secondary" onClick={onIniciar}>
          Iniciar sesión
        </button>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-badge">
          <span className="badge-icon">🎵</span>
          Música sin límites
        </div>

        <h1 className="hero-title">
          Escucha millones de <br />
          <span className="hero-title-highlight">canciones gratis</span>
        </h1>

        <p className="hero-subtitle">
          Descubre nueva música, crea tus playlists favoritas y disfruta
          <br />
          de la mejor experiencia de streaming sin costo alguno
        </p>

        <button className="btn-primary" onClick={onIniciar}>
          Comenzar ahora
          <span className="btn-arrow">→</span>
        </button>

        <p className="hero-hint">
          ✓ Sin tarjeta de crédito · ✓ Sin anuncios · ✓ Acceso ilimitado
        </p>
      </section>

      {/* Features */}
      <section className="landing-features">
        {[
          {
            icon: "🎧",
            title: "Calidad Premium",
            desc: "Audio de alta calidad para una experiencia única",
            color: "#f472b6"
          },
          {
            icon: "📱",
            title: "Multiplataforma",
            desc: "Escucha desde cualquier dispositivo",
            color: "#a78bfa"
          },
          {
            icon: "🎨",
            title: "Personalizado",
            desc: "Recomendaciones basadas en tus gustos",
            color: "#34d399"
          },
          {
            icon: "⚡",
            title: "Streaming Rápido",
            desc: "Carga instantánea sin interrupciones",
            color: "#facc15"
          }
        ].map((feat, i) => (
          <div
            key={i}
            className="feature-card"
            style={{
              transform: hoveredFeature === i ? "translateY(-8px)" : "translateY(0)",
              boxShadow: hoveredFeature === i
                ? `0 20px 40px rgba(29,185,84,0.2)`
                : "0 8px 24px rgba(0,0,0,0.4)"
            }}
            onMouseEnter={() => setHoveredFeature(i)}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            <div className="feature-icon" style={{ background: feat.color + "22" }}>
              <span>{feat.icon}</span>
            </div>
            <h3 className="feature-title">{feat.title}</h3>
            <p className="feature-desc">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <h2 className="cta-title">
          ¿Listo para la mejor <br />
          experiencia musical?
        </h2>
        <button className="btn-primary" onClick={onIniciar}>
          Crear cuenta gratis
          <span className="btn-arrow">→</span>
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p className="footer-text">
          © 2024 Spotifi. Música para todos.
        </p>
      </footer>
    </div>
  )
}
