import { useState, useEffect } from 'react'
import { buscarLixeira, restaurarRelatorio, excluirRelatorioPermanente } from '../services/api'

interface Props {
  dark: boolean
}

function diasRestantes(excluidoEm: string): number {
  const excluido = new Date(excluidoEm)
  const limite = new Date(excluido)
  limite.setDate(limite.getDate() + 30)
  const hoje = new Date()
  const diff = Math.ceil((limite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export default function Lixeira({ dark }: Props) {
  const bg = dark ? '#1B2A4A' : '#EEF1F7'
  const surface = dark ? '#101B25' : '#FFFFFF'
  const border = dark ? '#2A3F52' : '#DCE3EE'
  const text = dark ? '#EAF1F8' : '#1B2233'
  const muted = dark ? '#94AABF' : '#5C6B7E'
  const shadow = dark ? '0 1px 3px rgba(0,0,0,.4)' : '0 1px 3px rgba(20,30,50,.08)'

  const [lista, setLista] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)

  function mostrarToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }

  function carregar() {
    setCarregando(true)
    buscarLixeira()
      .then(dados => setLista(dados || []))
      .catch(() => setLista([]))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  async function restaurar(id: string, numero: string) {
    try {
      await restaurarRelatorio(id)
      setLista(l => l.filter(r => r.id !== id))
      mostrarToast(`Relatório Nº ${numero} restaurado!`)
    } catch {
      mostrarToast('Erro ao restaurar')
    }
  }

  async function excluirDefinitivo(id: string, numero: string) {
    try {
      await excluirRelatorioPermanente(id)
      setLista(l => l.filter(r => r.id !== id))
      setConfirmandoId(null)
      mostrarToast(`Relatório Nº ${numero} excluído permanentemente`)
    } catch {
      mostrarToast('Erro ao excluir')
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: bg, padding: '14px 14px 32px' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: dark ? '#2A1A1A' : '#FEF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 13, color: muted, fontWeight: 600 }}>{lista.length} relatório(s) na lixeira</div>
          <div style={{ fontSize: 12, color: muted, marginTop: 1 }}>Excluídos permanentemente após 30 dias</div>
        </div>
      </div>

      {carregando ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: muted }}>Carregando...</div>
      ) : lista.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: muted, fontSize: 14 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12, opacity: 0.5 }}>
            <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          <div>Lixeira vazia</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lista.map(r => {
            const dias = diasRestantes(r.excluido_em)
            return (
              <div key={r.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: '13px 14px', boxShadow: shadow }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: muted }}>Nº {r.numero_os}</span>
                      <span style={{ color: border }}>•</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: text }}>{r.piloto || '—'}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: muted, marginTop: 3 }}>{r.fazenda || '—'} · {r.municipio || '—'}</div>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: 12, background: dias <= 5 ? (dark ? '#2A1A1A' : '#FEF0F0') : (dark ? '#2A1E0A' : '#FEF3E2'), color: dias <= 5 ? '#C0392B' : '#E08A1E', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {dias} dia{dias !== 1 ? 's' : ''}
                  </div>
                </div>

                {confirmandoId === r.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 10, borderRadius: 10, background: dark ? '#2A1A1A' : '#FEF0F0' }}>
                    <span style={{ fontSize: 12.5, color: '#C0392B', fontWeight: 700 }}>Excluir para sempre? Não pode ser desfeito.</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setConfirmandoId(null)} style={{ flex: 1, height: 36, border: `1px solid ${border}`, borderRadius: 9, background: 'transparent', color: muted, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Cancelar
                      </button>
                      <button onClick={() => excluirDefinitivo(r.id, r.numero_os)} style={{ flex: 1, height: 36, border: 'none', borderRadius: 9, background: '#C0392B', color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Excluir agora
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => restaurar(r.id, r.numero_os)} style={{ flex: 1, height: 38, border: `1px solid #3E9E4E`, borderRadius: 10, background: 'transparent', color: '#3E9E4E', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                      Restaurar
                    </button>
                    <button onClick={() => setConfirmandoId(r.id)} style={{ flex: 1, height: 38, border: `1px solid #C0392B`, borderRadius: 10, background: 'transparent', color: '#C0392B', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: 96, transform: 'translateX(-50%)', background: dark ? '#1B2233' : '#283E55', color: '#fff', padding: '12px 18px', borderRadius: 13, fontSize: 13.5, fontWeight: 700, boxShadow: '0 12px 30px rgba(0,0,0,.32)', display: 'flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap', zIndex: 50 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3E9E4E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
        </div>
      )}
    </div>
  )
}