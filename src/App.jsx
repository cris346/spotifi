import { useState, useEffect } from "react"
import { supabase } from "./apis/cliente"
import Auth from "./components/Auth"

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Escuchar cambios de sesión (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
      </div>
    )
  }

  // Si no hay sesión → mostrar Login
  if (!session) return <Auth />

  // Si hay sesión → mostrar app principal
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.avatar}>
          {session.user.email[0].toUpperCase()}
        </div>
        <h2 style={styles.welcome}>¡Hola de nuevo! 👋</h2>
        <p style={styles.email}>{session.user.email}</p>
        <p style={styles.hint}>Sesión activa correctamente con Supabase Auth</p>
        <button style={styles.btn} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  loading: {
    minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center",
    background: "#0a0a0a",
  },
  spinner: {
    width: 40, height: 40, borderRadius: "50%",
    border: "3px solid #222",
    borderTop: "3px solid #39FDDD",
    animation: "spin 0.8s linear infinite",
  },
  page: {
    minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center",
    background: "#0a0a0a", fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: "#111", border: "1px solid #222",
    borderRadius: 20, padding: "48px 40px",
    textAlign: "center", maxWidth: 380, width: "100%",
    animation: "fadeIn 0.4s ease both",
  },
  avatar: {
    width: 72, height: 72, borderRadius: "50%",
    background: "#39FDDD", color: "#000",
    fontSize: 28, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 20px",
  },
  welcome: {
    color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 8,
  },
  email: {
    color: "#888", fontSize: 14, marginBottom: 12,
  },
  hint: {
    color: "#39FDDD", fontSize: 13, marginBottom: 28,
  },
  btn: {
    padding: "12px 32px", background: "transparent",
    border: "1.5px solid #333", borderRadius: 50,
    color: "#fff", fontSize: 14, cursor: "pointer",
    transition: "border-color 0.2s",
  },
}