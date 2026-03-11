import { useState } from "react"
import { supabase } from "../apis/cliente"
import "./style/Auth.css"

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
        if (error) setError(error.message)
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
        <div className="auth-page">
            {/* Fondo animado */}
            <div className="auth-bg">
                <div className="auth-blob1" />
                <div className="auth-blob2" />
                <div className="auth-blob3" />
            </div>

            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo-wrap">
                    <img src="/sporifi.png" alt="imagen spotifi" width="50px" height="50px" />
                </div>

                {/* Título */}
                <h1 className="auth-titulo">
                    {modo === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
                </h1>
                <p className="auth-subtitulo">
                    {modo === "login"
                        ? "Inicia sesión para continuar escuchando"
                        : "Únete y empieza a escuchar gratis"}
                </p>

                {/* Tabs */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab${modo === "login" ? " active" : ""}`}
                        onClick={() => { setModo("login"); setError(""); setMensaje("") }}
                    >
                        Iniciar sesión
                    </button>
                    <button
                        className={`auth-tab${modo === "registro" ? " active" : ""}`}
                        onClick={() => { setModo("registro"); setError(""); setMensaje("") }}
                    >
                        Registrarse
                    </button>
                </div>

                {/* Campos */}
                <div className="auth-fields">
                    {modo === "registro" && (
                        <div className="auth-field-wrap">
                            <label className="auth-label">Nombre</label>
                            <input
                                className="auth-input"
                                type="text"
                                name="nombre"
                                placeholder="Tu nombre"
                                value={form.nombre}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    <div className="auth-field-wrap">
                        <label className="auth-label">Email</label>
                        <input
                            className="auth-input"
                            type="email"
                            name="email"
                            placeholder="tu@email.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="auth-field-wrap">
                        <label className="auth-label">Contraseña</label>
                        <input
                            className="auth-input"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Error / Mensaje */}
                {error && <p className="auth-error">⚠ {error}</p>}
                {mensaje && <p className="auth-success">✅ {mensaje}</p>}

                {/* Botón */}
                <button
                    className="auth-btn"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Cargando..." : modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </button>

                {/* Footer */}
                <p className="auth-footer">
                    {modo === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                    <span
                        className="auth-link"
                        onClick={() => { setModo(modo === "login" ? "registro" : "login"); setError(""); setMensaje("") }}
                    >
                        {modo === "login" ? "Regístrate" : "Inicia sesión"}
                    </span>
                </p>
            </div>
        </div>
    )
}