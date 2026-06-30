import { useState } from 'react'
import { login } from '../services/auth'

interface Props {
  onLogin: (senhaTemproraria: boolean) => void
}

export default function Login({ onLogin }: Props) {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [tema, setTema] = useState<'dark' | 'light'>('dark')

  const dark = tema === 'dark'

  async function handleLogin() {
    if (!usuario || !senha) {
      setErro('Preencha usuário e senha')
      return
    }
    setCarregando(true)
    setErro('')
    try {
      const resultado = await login(usuario, senha)
      onLogin(resultado.usuario?.senha_temporaria === true)
    } catch (e: any) {
      setErro(e?.response?.data?.erro || 'Usuário ou senha incorretos')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: dark ? '#1A1F2E' : '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 24px 40px',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      position: 'relative'
    }}>

      {/* Botão tema */}
      <button
        onClick={() => setTema(dark ? 'light' : 'dark')}
        style={{
          position: 'absolute', top: 20, right: 20,
          background: 'transparent', border: 'none',
          cursor: 'pointer', padding: 8,
          color: dark ? '#fff' : '#1A1F2E'
        }}
        title="Alternar tema"
      >
        {dark ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>

      {/* Logo */}
      <div style={{ marginTop: 60, marginBottom: 10, textAlign: 'center' }}>
        <img
          src={dark ? '/src/assets/logo-dark.svg' : '/src/assets/logo-light.svg'}
          alt="VGR Logo"
          style={{ width: 200, height: 'auto' }}
        />
      </div>

      {/* Título */}
      <h1 style={{
        fontFamily: "'JetBrains Mono', monospace, 'Courier New'",
        fontSize: 24,
        fontWeight: 700,
        color: '#3E9E4E',
        letterSpacing: '0.05em',
        textAlign: 'center',
        marginBottom: 40,
        marginTop: 0
      }}>
        Seja Bem Vindo Piloto
      </h1>

      {/* Card formulário */}
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: dark ? '#252D3D' : '#F2F4F8',
        borderRadius: 18,
        padding: '28px 22px 24px',
      }}>

        {/* Usuário */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: dark ? '#94AABF' : '#5C6B7E', marginBottom: 8 }}>
            Usuário
          </label>
          <input
            type="text"
            placeholder="Digite seu usuário"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', boxSizing: 'border-box', height: 52,
              padding: '0 16px', borderRadius: 12, border: 'none',
              background: dark ? '#1A2330' : '#FFFFFF',
              color: dark ? '#EAF1F8' : '#1B2233',
              fontSize: 15, outline: 'none',
            }}
          />
        </div>

        {/* Senha */}
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: dark ? '#94AABF' : '#5C6B7E', marginBottom: 8 }}>
            Senha
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="Digite sua senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%', boxSizing: 'border-box', height: 52,
                padding: '0 48px 0 16px', borderRadius: 12, border: 'none',
                background: dark ? '#1A2330' : '#FFFFFF',
                color: dark ? '#EAF1F8' : '#1B2233',
                fontSize: 15, outline: 'none',
              }}
            />
            <button
              onClick={() => setMostrarSenha(!mostrarSenha)}
              style={{
                position: 'absolute', right: 14, top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent', border: 'none',
                cursor: 'pointer', color: dark ? '#94AABF' : '#5C6B7E',
                padding: 4, display: 'flex', alignItems: 'center'
              }}
            >
              {mostrarSenha ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Esqueci senha */}
        <div style={{ textAlign: 'right', marginBottom: 20 }}>
          <a href="#" style={{ fontSize: 13, color: '#3E9E4E', textDecoration: 'none', fontWeight: 500 }}>
            Esqueci minha senha
          </a>
        </div>

        {/* Erro */}
        {erro && (
          <div style={{
            background: 'rgba(242,85,90,0.12)', border: '1px solid rgba(242,85,90,0.3)',
            color: '#F2555A', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16
          }}>
            {erro}
          </div>
        )}

        {/* Botão Entrar */}
        <button
          onClick={handleLogin}
          disabled={carregando}
          style={{
            width: '100%', height: 52, borderRadius: 26, border: 'none',
            background: '#3E9E4E', color: '#fff', fontSize: 16, fontWeight: 700,
            cursor: carregando ? 'not-allowed' : 'pointer',
            opacity: carregando ? 0.7 : 1,
            boxShadow: '0 8px 20px rgba(62,158,78,0.35)',
            fontFamily: 'inherit'
          }}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </div>

      <p style={{ marginTop: 32, fontSize: 12, color: dark ? '#4A5568' : '#94AABF' }}>
        VGR Gestão Contábil • AgroPilot v1.0
      </p>
    </div>
  )
}