import { useState, useEffect } from "react"
import { supabase } from "./apis/cliente"
import Landing from "./components/Landing"
import Auth from "./components/Auth"
import Home from "./components/Home"
import Canciones from "./components/Canciones"

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mostrarAuth, setMostrarAuth] = useState(false)
  const [vista, setVista] = useState("home") // "home" | "canciones"

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        setVista("home") // Al iniciar sesión, ir a home
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
      </div>
    )
  }

  // Con sesión activa → mostrar Home o Canciones según vista
  if (session) {
    if (vista === "home") {
      return <Home session={session} onNavigate={setVista} />
    }
    if (vista === "canciones") {
      return <Canciones session={session} onNavigate={setVista} />
    }
  }

  // Sin sesión → mostrar Landing o Auth
  if (!mostrarAuth) {
    return <Landing onIniciar={() => setMostrarAuth(true)} />
  }

  return <Auth />
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
}