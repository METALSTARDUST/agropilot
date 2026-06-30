import { useState, useEffect } from 'react'
import { getSessao } from './services/auth'
import { baixarCadastrosParaOffline, ativarSincronizacaoAutomatica, sincronizarRelatoriosPendentes } from './services/sync'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TrocarSenha from './pages/TrocarSenha'

export default function App() {
  const [tela, setTela] = useState<'carregando' | 'login' | 'trocar-senha' | 'dashboard'>('carregando')
  const [toastSync, setToastSync] = useState<string | null>(null)

  useEffect(() => {
    getSessao().then(sessao => {
      if (!sessao) {
        setTela('login')
      } else {
        const u = sessao.usuario as any
        // Piloto com senha temporária vai pra tela de troca antes do dashboard
        setTela(u?.senha_temporaria ? 'trocar-senha' : 'dashboard')
      }
    })

    ativarSincronizacaoAutomatica((qtd) => {
      setToastSync(`${qtd} relatório(s) sincronizado(s)!`)
      setTimeout(() => setToastSync(null), 3000)
    })
  }, [])

  useEffect(() => {
    if (tela === 'dashboard') {
      baixarCadastrosParaOffline()
      sincronizarRelatoriosPendentes()
    }
  }, [tela])

  function handleLogin(senhaTemproraria: boolean) {
    if (senhaTemproraria) {
      setTela('trocar-senha')
    } else {
      setTela('dashboard')
    }
  }

  if (tela === 'carregando') {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A131A' }}>
        <div style={{ color: '#94AABF', fontSize: 14 }}>Carregando...</div>
      </div>
    )
  }

  return (
    <>
      {tela === 'login' && <Login onLogin={handleLogin} />}
      {tela === 'trocar-senha' && <TrocarSenha onConcluido={() => setTela('dashboard')} />}
      {tela === 'dashboard' && <Dashboard onLogout={() => setTela('login')} />}

      {toastSync && (
        <div style={{ position: 'fixed', left: '50%', top: 20, transform: 'translateX(-50%)', background: '#1B2233', color: '#fff', padding: '12px 18px', borderRadius: 13, fontSize: 13.5, fontWeight: 700, boxShadow: '0 12px 30px rgba(0,0,0,.32)', display: 'flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap', zIndex: 100 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3E9E4E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.2-8.6"/><polyline points="21 4 21 9 16 9"/>
          </svg>
          {toastSync}
        </div>
      )}
    </>
  )
}