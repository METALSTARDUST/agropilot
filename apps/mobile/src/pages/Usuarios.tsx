import { useState, useEffect } from 'react'
import { criarPiloto as criarPilotoAPI, buscarUsuarios, toggleAtivoUsuario, excluirUsuario, definirSenhaUsuario } from '../services/api'

interface Props {
  dark: boolean
  onVerRelatorios?: (piloto: string) => void
}

interface Usuario {
  id: string
  nome: string
  email: string
  perfil: 'piloto' | 'admin'
  ativo: boolean
}

export default function Usuarios({ dark, onVerRelatorios }: Props) {
  const bg = dark ? '#1B2A4A' : '#EEF1F7'
  const surface = dark ? '#101B25' : '#FFFFFF'
  const border = dark ? '#2A3F52' : '#DCE3EE'
  const text = dark ? '#EAF1F8' : '#1B2233'
  const muted = dark ? '#94AABF' : '#5C6B7E'
  const inputBg = dark ? '#172A38' : '#FBFCFE'
  const greenSoft = dark ? '#12331E' : '#E8F4EA'
  const shadow = dark ? '0 1px 3px rgba(0,0,0,.4)' : '0 1px 3px rgba(20,30,50,.08)'

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    setCarregando(true)
    buscarUsuarios()
      .then(dados => { if (dados) setUsuarios(dados) })
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])
  const [criando, setCriando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [novoNome, setNovoNome] = useState('')
  const [novoEmail, setNovoEmail] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [senhaTemporaria, setSenhaTemporaria] = useState(false)

  // Estado do modal de resetar senha
  const [resetandoUsuario, setResetandoUsuario] = useState<Usuario | null>(null)
  const [resetSenha, setResetSenha] = useState('')
  const [resetTemporaria, setResetTemporaria] = useState(true)
  const [resetSalvando, setResetSalvando] = useState(false)

  function mostrarToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }

  function cancelar() {
    setCriando(false)
    setNovoNome('')
    setNovoEmail('')
    setNovaSenha('')
    setMostrarSenha(false)
    setSenhaTemporaria(false)
  }

  async function criarPiloto() {
    if (!novoNome.trim() || !novaSenha.trim()) {
      mostrarToast('Preencha nome e senha')
      return
    }
    if (novaSenha.length < 6) {
      mostrarToast('Senha mínimo 6 caracteres')
      return
    }
    setSalvando(true)
    try {
      const criado = await criarPilotoAPI({
        nome: novoNome.trim(),
        senha: novaSenha,
        email: novoEmail.trim() || undefined,
        senha_temporaria: senhaTemporaria,
      })
      const novo: Usuario = {
        id: criado.usuario?.id || String(Date.now()),
        nome: novoNome.trim().toUpperCase(),
        email: novoEmail.trim() || `${novoNome.trim().toLowerCase().replace(/\s/g, '')}@vgr.com`,
        perfil: 'piloto',
        ativo: true,
      }
      setUsuarios(u => [...u, novo])
      cancelar()
      mostrarToast(`Piloto ${novo.nome} criado!`)
    } catch (e: any) {
      mostrarToast(e?.response?.data?.erro || 'Erro ao criar piloto')
    } finally {
      setSalvando(false)
    }
  }

  async function resetarSenha() {
    if (!resetandoUsuario || resetSenha.length < 6) {
      mostrarToast('Senha mínimo 6 caracteres')
      return
    }
    setResetSalvando(true)
    try {
      await definirSenhaUsuario(resetandoUsuario.id, resetSenha, resetTemporaria)
      setResetandoUsuario(null)
      setResetSenha('')
      mostrarToast(`Senha de ${resetandoUsuario.nome} redefinida!`)
    } catch (e: any) {
      mostrarToast(e?.response?.data?.erro || 'Erro ao redefinir senha')
    } finally {
      setResetSalvando(false)
    }
  }

  async function toggleAtivo(u: Usuario) {
    const novoStatus = !u.ativo
    // Atualiza na tela imediatamente (otimista)
    setUsuarios(lista => lista.map(x => x.id === u.id ? { ...x, ativo: novoStatus } : x))
    try {
      await toggleAtivoUsuario(u.id, novoStatus)
    } catch {
      // Reverte se der erro
      setUsuarios(lista => lista.map(x => x.id === u.id ? { ...x, ativo: u.ativo } : x))
      mostrarToast('Erro ao atualizar — tente novamente')
    }
  }

  async function confirmarExclusao(u: Usuario) {
    if (!confirm(`Excluir permanentemente o piloto "${u.nome}"?\nEssa ação não pode ser desfeita.`)) return
    try {
      await excluirUsuario(u.id)
      setUsuarios(lista => lista.filter(x => x.id !== u.id))
      mostrarToast(`Piloto ${u.nome} excluído`)
    } catch (e: any) {
      mostrarToast(e?.response?.data?.erro || 'Erro ao excluir usuário')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    height: 46,
    padding: '0 14px',
    borderRadius: 11,
    border: `1px solid ${border}`,
    background: inputBg,
    color: text,
    fontSize: 15,
    outline: 'none',
    fontFamily: 'inherit'
  }

  const Label = ({ children }: { children: string }) => (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: muted, margin: '0 0 5px 2px' }}>
      {children}
    </label>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: bg, padding: '14px 14px 32px' }}>

      {/* Header da seção */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 13, color: muted, fontWeight: 600 }}>Total: {usuarios.length} usuários</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>
            <span style={{ color: '#3E9E4E' }}>{usuarios.filter(u => u.ativo).length} ativos</span>
            <span style={{ color: muted }}> · </span>
            <span style={{ color: '#C0392B' }}>{usuarios.filter(u => !u.ativo).length} inativos</span>
          </div>
        </div>
        {!criando && (
          <button
            onClick={() => setCriando(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', border: 'none', borderRadius: 12, background: '#3E9E4E', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 16px rgba(62,158,78,.3)', fontFamily: 'inherit' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo piloto
          </button>
        )}
      </div>

      {/* Formulário criar piloto */}
      {criando && (
        <div style={{ background: surface, border: `1.5px solid #3E9E4E`, borderRadius: 18, padding: 18, boxShadow: shadow, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3E9E4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: text }}>Novo piloto</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div>
              <Label>Nome / Usuário</Label>
              <input
                value={novoNome}
                onChange={e => setNovoNome(e.target.value)}
                placeholder="Ex.: MAURIVAN"
                style={inputStyle}
              />
            </div>

            <div>
              <Label>Email (opcional)</Label>
              <input
                value={novoEmail}
                onChange={e => setNovoEmail(e.target.value)}
                placeholder="piloto@vgr.com"
                inputMode="email"
                style={inputStyle}
              />
            </div>

            <div>
              <Label>Senha</Label>
              <div style={{ position: 'relative' }}>
                <input
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  style={{ ...inputStyle, paddingRight: 48 }}
                />
                <button
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: muted, display: 'flex', alignItems: 'center', padding: 4 }}
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

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 11, background: dark ? '#0F1E2A' : '#F4F7FB', border: `1px solid ${border}` }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: text }}>Senha temporária</div>
                <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>Piloto precisará criar nova senha no primeiro login</div>
              </div>
              <button
                onClick={() => setSenhaTemporaria(!senhaTemporaria)}
                style={{ width: 44, height: 26, borderRadius: 13, border: 'none', background: senhaTemporaria ? '#3E9E4E' : (dark ? '#2A3F52' : '#DCE3EE'), cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' }}
              >
                <span style={{ position: 'absolute', top: 3, left: senhaTemporaria ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', display: 'block' }} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
              <button
                onClick={cancelar}
                style={{ flex: 1, height: 46, border: `1px solid ${border}`, borderRadius: 12, background: 'transparent', color: muted, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancelar
              </button>
              <button
                onClick={criarPiloto}
                disabled={salvando}
                style={{ flex: 2, height: 46, border: 'none', borderRadius: 12, background: '#3E9E4E', color: '#fff', fontSize: 14, fontWeight: 700, cursor: salvando ? 'not-allowed' : 'pointer', opacity: salvando ? 0.7 : 1, fontFamily: 'inherit' }}
              >
                {salvando ? 'Criando...' : 'Criar piloto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de usuários */}
      {carregando ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: muted, fontSize: 14 }}>Carregando...</div>
      ) : usuarios.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: muted, fontSize: 14 }}>Nenhum usuário encontrado.</div>
      ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {usuarios.map(u => (
          <div key={u.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: '14px 16px', boxShadow: shadow, display: 'flex', alignItems: 'center', gap: 13 }}>

            {/* Avatar */}
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: u.ativo ? greenSoft : (dark ? '#1E2A35' : '#F0F2F5'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20, fontWeight: 800, color: u.ativo ? '#3E9E4E' : muted }}>
              {u.nome.charAt(0)}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: u.ativo ? text : muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {u.nome}
              </div>
              <div style={{ fontSize: 11.5, color: muted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {u.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <span style={{ padding: '3px 9px', borderRadius: 8, background: u.perfil === 'admin' ? (dark ? '#0D1E2E' : '#EBF3FC') : greenSoft, color: u.perfil === 'admin' ? '#4F9CE8' : '#3E9E4E', fontSize: 10.5, fontWeight: 700 }}>
                  {u.perfil === 'admin' ? 'Admin' : 'Piloto'}
                </span>
                <span style={{ padding: '3px 9px', borderRadius: 8, background: u.ativo ? greenSoft : (dark ? '#2A1A1A' : '#FEF0F0'), color: u.ativo ? '#3E9E4E' : '#C0392B', fontSize: 10.5, fontWeight: 700 }}>
                  {u.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>

            {/* Botões ação */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => onVerRelatorios && onVerRelatorios(u.nome)}
                title="Ver relatórios"
                style={{ width: 40, height: 40, borderRadius: 11, border: `1px solid ${border}`, background: dark ? '#16252F' : '#F4F7FB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3E9E4E' }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <circle cx="3.6" cy="6" r="1.3" fill="currentColor" stroke="none"/>
                  <circle cx="3.6" cy="12" r="1.3" fill="currentColor" stroke="none"/>
                  <circle cx="3.6" cy="18" r="1.3" fill="currentColor" stroke="none"/>
                </svg>
              </button>
              <button
                onClick={() => toggleAtivo(u)}
                title={u.ativo ? 'Desativar piloto' : 'Ativar piloto'}
                style={{ width: 40, height: 40, borderRadius: 11, border: `1px solid ${border}`, background: dark ? '#16252F' : '#F4F7FB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.ativo ? '#E08A1E' : '#3E9E4E' }}
              >
                {u.ativo ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              {u.perfil !== 'admin' && (
                <button
                  onClick={() => confirmarExclusao(u)}
                  title="Excluir piloto permanentemente"
                  style={{ width: 40, height: 40, borderRadius: 11, border: `1px solid ${border}`, background: dark ? '#16252F' : '#F4F7FB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C0392B' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              )}
              <button
                onClick={() => { setResetandoUsuario(u); setResetSenha(''); setResetTemporaria(true) }}
                title="Redefinir senha"
                style={{ width: 40, height: 40, borderRadius: 11, border: `1px solid ${border}`, background: dark ? '#16252F' : '#F4F7FB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F9CE8' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Modal resetar senha */}
      {resetandoUsuario && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ background: surface, borderRadius: 20, padding: 24, width: '100%', maxWidth: 380, boxShadow: '0 24px 60px rgba(0,0,0,.4)' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: text, marginBottom: 4 }}>Redefinir senha</div>
            <div style={{ fontSize: 13, color: muted, marginBottom: 20 }}>{resetandoUsuario.nome}</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' as const, color: muted, marginBottom: 5 }}>Nova senha</label>
              <input
                type="password"
                value={resetSenha}
                onChange={e => setResetSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoFocus
                style={{ width: '100%', boxSizing: 'border-box', height: 46, padding: '0 14px', borderRadius: 11, border: `1px solid ${border}`, background: inputBg, color: text, fontSize: 15, outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 11, background: dark ? '#0F1E2A' : '#F4F7FB', border: `1px solid ${border}`, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: text }}>Senha temporária</div>
                <div style={{ fontSize: 11.5, color: muted, marginTop: 1 }}>Piloto troca no próximo login</div>
              </div>
              <button
                onClick={() => setResetTemporaria(!resetTemporaria)}
                style={{ width: 44, height: 26, borderRadius: 13, border: 'none', background: resetTemporaria ? '#3E9E4E' : (dark ? '#2A3F52' : '#DCE3EE'), cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' }}
              >
                <span style={{ position: 'absolute', top: 3, left: resetTemporaria ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', display: 'block' }} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setResetandoUsuario(null)} style={{ flex: 1, height: 46, border: `1px solid ${border}`, borderRadius: 12, background: 'transparent', color: muted, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button onClick={resetarSenha} disabled={resetSalvando} style={{ flex: 2, height: 46, border: 'none', borderRadius: 12, background: '#4F9CE8', color: '#fff', fontSize: 14, fontWeight: 700, cursor: resetSalvando ? 'not-allowed' : 'pointer', opacity: resetSalvando ? 0.7 : 1, fontFamily: 'inherit' }}>
                {resetSalvando ? 'Salvando...' : 'Redefinir senha'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: 96, transform: 'translateX(-50%)', background: dark ? '#1B2233' : '#283E55', color: '#fff', padding: '12px 18px', borderRadius: 13, fontSize: 13.5, fontWeight: 700, boxShadow: '0 12px 30px rgba(0,0,0,.32)', display: 'flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap', zIndex: 50 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3E9E4E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {toast}
        </div>
      )}
    </div>
  )
}