import { useState } from "react"
import { supabase } from "../apis/cliente"

export default function Auth() {
    const [modo, setModo] = useState("login") // "login" | "registro"
    const [form, setForm] = useState({ nombre: "", email: "", password: "" })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [mensaje, setMensaje] = useState("")

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError("")
    }

    const handleLogin = async () => {
        setLoading(true)
        setError("")
        const { error } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
        })
        if (error) {
            if (error.message.includes("Email not confirmed")) {
                setError("Confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.")
            } else if (error.message.includes("Invalid login credentials")) {
                setError("Email o contraseña incorrectos.")
            } else {
                setError(error.message)
            }
        }
        setLoading(false)
    }

    const handleRegistro = async () => {
        setLoading(true)
        setError("")
        const { data, error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: { nombre: form.nombre },
            },
        })
        if (error) {
            setError(error.message)
        } else {
            // Insertar también en la tabla Usuarios
            if (data.user) {
                await supabase.from("Usuarios").insert({
                    nombre: form.nombre,
                    email: form.email,
                    tipo_suscripcion: "Gratis",
                })
            }
            setMensaje("¡Cuenta creada! Revisa tu email para confirmar.")
        }
        setLoading(false)
    }

    const handleSubmit = () => {
        if (!form.email || !form.password) {
            setError("Por favor llena todos los campos.")
            return
        }
        if (modo === "login") handleLogin()
        else handleRegistro()
    }

    return (
        <div style={styles.page}>
            {/* Fondo animado */}
            <div style={styles.bg}>
                <div style={styles.blob1} />
                <div style={styles.blob2} />
                <div style={styles.blob3} />
            </div>

            <div style={styles.card}>
                {/* Logo */}
                <div style={styles.logoWrap}>
                    <img src="/sporifi.png" alt="imagen spotifi" width="50px" height="50px" />
                </div>

                {/* Título */}
                <h1 style={styles.titulo}>
                    {modo === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
                </h1>
                <p style={styles.subtitulo}>
                    {modo === "login"
                        ? "Inicia sesión para continuar escuchando"
                        : "Únete y empieza a escuchar gratis"}
                </p>

                {/* Tabs */}
                <div style={styles.tabs}>
                    <button
                        style={{ ...styles.tab, ...(modo === "login" ? styles.tabActive : {}) }}
                        onClick={() => { setModo("login"); setError(""); setMensaje("") }}
                    >
                        Iniciar sesión
                    </button>
                    <button
                        style={{ ...styles.tab, ...(modo === "registro" ? styles.tabActive : {}) }}
                        onClick={() => { setModo("registro"); setError(""); setMensaje("") }}
                    >
                        Registrarse
                    </button>
                </div>

                {/* Campos */}
                <div style={styles.fields}>
                    {modo === "registro" && (
                        <div style={styles.fieldWrap}>
                            <label style={styles.label}>Nombre</label>
                            <input
                                style={styles.input}
                                type="text"
                                name="nombre"
                                placeholder="Tu nombre"
                                value={form.nombre}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    <div style={styles.fieldWrap}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            name="email"
                            placeholder="tu@email.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={styles.fieldWrap}>
                        <label style={styles.label}>Contraseña</label>
                        <input
                            style={styles.input}
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Error / Mensaje */}
                {error && <p style={styles.error}>⚠ {error}</p>}
                {mensaje && <p style={styles.success}>✅ {mensaje}</p>}

                {/* Botón */}
                <button
                    style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Cargando..." : modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </button>

                {/* Footer */}
                <p style={styles.footer}>
                    {modo === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                    <span
                        style={styles.link}
                        onClick={() => { setModo(modo === "login" ? "registro" : "login"); setError(""); setMensaje("") }}
                    >
                        {modo === "login" ? "Regístrate" : "Inicia sesión"}
                    </span>
                </p>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Circular+Std:wght@400;700&family=DM+Sans:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 30px) scale(0.95); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, 20px) scale(1.05); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        input:focus {
          outline: none;
          border-color: #39FDDD !important;
          box-shadow: 0 0 0 3px rgba(29,185,84,0.18);
        }
        input::placeholder { color: #555; }
      `}</style>
        </div>
    )
}

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
    },
    bg: {
        position: "absolute", inset: 0, zIndex: 0,
    },
    blob1: {
        position: "absolute", width: 480, height: 480,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(29,185,84,0.22) 0%, transparent 70%)",
        top: "-120px", left: "-100px",
        animation: "float1 8s ease-in-out infinite",
    },
    blob2: {
        position: "absolute", width: 380, height: 380,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(29,185,84,0.12) 0%, transparent 70%)",
        bottom: "-80px", right: "-60px",
        animation: "float2 10s ease-in-out infinite",
    },
    blob3: {
        position: "absolute", width: 280, height: 280,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(29,185,84,0.08) 0%, transparent 70%)",
        top: "50%", right: "20%",
        animation: "float3 12s ease-in-out infinite",
    },
    card: {
        position: "relative", zIndex: 1,
        background: "rgba(18,18,18,0.92)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        padding: "44px 40px",
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        animation: "fadeIn 0.5s ease both",
    },
    logoWrap: {
        display: "flex", alignItems: "center", gap: 10, marginBottom: 28,
    },
    logoText: {
        fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px",
    },
    titulo: {
        fontSize: 26, fontWeight: 700, color: "#fff",
        letterSpacing: "-0.5px", marginBottom: 6,
    },
    subtitulo: {
        fontSize: 14, color: "#888", marginBottom: 28,
    },
    tabs: {
        display: "flex", background: "#1a1a1a",
        borderRadius: 10, padding: 4, marginBottom: 28, gap: 4,
    },
    tab: {
        flex: 1, padding: "9px 0", borderRadius: 8,
        border: "none", background: "transparent",
        color: "#666", fontSize: 14, fontWeight: 500,
        cursor: "pointer", transition: "all 0.2s",
    },
    tabActive: {
        background: "#39FDDD", color: "#000", fontWeight: 700,
        boxShadow: "0 2px 12px rgba(29,185,84,0.3)",
    },
    fields: {
        display: "flex", flexDirection: "column", gap: 16, marginBottom: 8,
    },
    fieldWrap: {
        display: "flex", flexDirection: "column", gap: 6,
    },
    label: {
        fontSize: 13, color: "#aaa", fontWeight: 500,
    },
    input: {
        background: "#1a1a1a",
        border: "1.5px solid #2a2a2a",
        borderRadius: 10, padding: "12px 14px",
        color: "#fff", fontSize: 15,
        transition: "border-color 0.2s, box-shadow 0.2s",
        width: "100%",
    },
    error: {
        color: "#ff5555", fontSize: 13, marginTop: 12, marginBottom: 4,
    },
    success: {
        color: "#39FDDD", fontSize: 13, marginTop: 12, marginBottom: 4,
    },
    btn: {
        width: "100%", padding: "14px",
        background: "#39FDDD", color: "#000",
        border: "none", borderRadius: 50,
        fontSize: 15, fontWeight: 700,
        cursor: "pointer", marginTop: 20,
        transition: "transform 0.15s, background 0.2s",
        letterSpacing: "0.2px",
    },
    footer: {
        textAlign: "center", marginTop: 20,
        fontSize: 13, color: "#666",
    },
    link: {
        color: "#39FDDD", cursor: "pointer", fontWeight: 600,
        textDecoration: "underline",
    },
}