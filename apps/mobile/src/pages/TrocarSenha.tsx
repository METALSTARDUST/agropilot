import { useState } from 'react'
import type { CSSProperties } from 'react'
import { trocarPropriaSenha } from '../services/api'
import { logout } from '../services/auth'

interface Props {
  onConcluido: () => void
}

export default function TrocarSenha({ onConcluido }: Props) {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function salvar() {
    setErro('')
    if (!novaSenha || !confirmar) { setErro('Preencha os dois campos'); return }
    if (novaSenha.length < 6) { setErro('Senha deve ter no mínimo 6 caracteres'); return }
    if (novaSenha !== confirmar) { setErro('As senhas não coincidem'); return }
    setSalvando(true)
    try {
      await trocarPropriaSenha(novaSenha)
      onConcluido()
    } catch (e: any) {
      setErro(e?.response?.data?.erro || 'Erro ao trocar senha')
    } finally {
      setSalvando(false)
    }
  }

  const iStyle: CSSProperties = {
    width: '100%', boxSizing: 'border-box', height: 50,
    padding: '0 16px', borderRadius: 12, border: 'none',
    background: '#1A2330', color: '#EAF1F8',
    fontSize: 15, outline: 'none', fontFamily: 'inherit'
  }
  const Lbl = ({ children }: { children: string }) => (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' as const, color: '#94AABF', marginBottom: 6 }}>{children}</label>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#1A1F2E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#12331E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3E9E4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#EAF1F8', marginBottom: 8 }}>Crie sua senha</div>
          <div style={{ fontSize: 14, color: '#94AABF', lineHeight: 1.5 }}>Você está usando uma senha temporária. Crie uma senha pessoal pra continuar.</div>
        </div>

        <div style={{ background: '#252D3D', borderRadius: 18, padding: '24px 20px' }}>
          <div style={{ marginBottom: 14 }}>
            <Lbl>Nova senha</Lbl>
            <div style={{ position: 'relative' }}>
              <input type={mostrarSenha ? 'text' : 'password'} value={novaSenha} onChange={e => setNovaSenha(e.target.value)} onKeyDown={e => e.key === 'Enter' && salvar()} placeholder="Mínimo 6 caracteres" style={{ ...iStyle, paddingRight: 48 }} />
              <button onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94AABF', display: 'flex', alignItems: 'center', padding: 4 }}>
                {mostrarSenha ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <Lbl>Confirmar senha</Lbl>
            <input type={mostrarSenha ? 'text' : 'password'} value={confirmar} onChange={e => setConfirmar(e.target.value)} onKeyDown={e => e.key === 'Enter' && salvar()} placeholder="Digite a senha novamente" style={iStyle} />
          </div>

          {erro && (
            <div style={{ background: 'rgba(192,57,43,.15)', border: '1px solid rgba(192,57,43,.3)', color: '#E74C3C', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{erro}</div>
          )}

          <button onClick={salvar} disabled={salvando} style={{ width: '100%', height: 50, borderRadius: 25, border: 'none', background: '#3E9E4E', color: '#fff', fontSize: 15, fontWeight: 800, cursor: salvando ? 'not-allowed' : 'pointer', opacity: salvando ? 0.7 : 1, boxShadow: '0 8px 20px rgba(62,158,78,.3)', fontFamily: 'inherit' }}>
            {salvando ? 'Salvando...' : 'Criar minha senha'}
          </button>
        </div>

        <button onClick={async () => { await logout(); window.location.reload() }} style={{ display: 'block', margin: '20px auto 0', background: 'transparent', border: 'none', color: '#94AABF', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Sair e entrar com outra conta
        </button>
      </div>
    </div>
  )
}