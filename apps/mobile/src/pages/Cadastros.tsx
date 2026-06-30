import { useState, useEffect } from 'react'
import { buscarCadastros, criarCadastro, atualizarCadastro } from '../services/api'

interface Props {
  dark: boolean
}

type TipoCadastro = 'proprietario' | 'fazenda' | 'municipio' | 'piloto' | 'aeronave' | 'cultura' | 'equipamento'

interface Cadastro {
  id: string
  codigo: number
  valor: string
  ativo: boolean
}

const tiposConfig: Record<TipoCadastro, { label: string; cor: string; bg: string }> = {
  proprietario: { label: 'Proprietário', cor: '#E08A1E', bg: '#2A1E0A' },
  fazenda: { label: 'Fazenda', cor: '#3E9E4E', bg: '#12331E' },
  municipio: { label: 'Município', cor: '#4F9CE8', bg: '#0D1E2E' },
  piloto: { label: 'Piloto', cor: '#7B7DF0', bg: '#13132E' },
  aeronave: { label: 'Aeronave', cor: '#3E9E4E', bg: '#12331E' },
  cultura: { label: 'Cultura', cor: '#4F9CE8', bg: '#0D1E2E' },
  equipamento: { label: 'Equipamento', cor: '#94AABF', bg: '#16252F' },
}

export default function Cadastros({ dark }: Props) {
  const bg = dark ? '#1B2A4A' : '#EEF1F7'
  const surface = dark ? '#101B25' : '#FFFFFF'
  const border = dark ? '#2A3F52' : '#DCE3EE'
  const text = dark ? '#EAF1F8' : '#1B2233'
  const muted = dark ? '#94AABF' : '#5C6B7E'
  const inputBg = dark ? '#172A38' : '#FBFCFE'
  const shadow = dark ? '0 1px 3px rgba(0,0,0,.4)' : '0 1px 3px rgba(20,30,50,.08)'

  const [tipoAtivo, setTipoAtivo] = useState<TipoCadastro>('proprietario')
  const [lista, setLista] = useState<Cadastro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [adicionando, setAdicionando] = useState(false)
  const [novoValor, setNovoValor] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editandoValor, setEditandoValor] = useState('')

  function mostrarToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }

  // Carrega do banco sempre que troca de tipo
  useEffect(() => {
    setCarregando(true)
    buscarCadastros(tipoAtivo)
      .then(dados => {
        const normalizado: Cadastro[] = (dados || []).map((d: any) => ({
          id: d.id,
          codigo: d.codigo,
          valor: d.valor,
          ativo: d.ativo,
        }))
        setLista(normalizado)
      })
      .catch(() => setLista([]))
      .finally(() => setCarregando(false))
  }, [tipoAtivo])

  const config = tiposConfig[tipoAtivo]
  const proximoCodigo = lista.length > 0 ? Math.max(...lista.map(i => i.codigo)) + 1 : 1

  async function adicionar() {
    if (!novoValor.trim()) {
      mostrarToast('Digite o nome do cadastro')
      return
    }
    setSalvando(true)
    try {
      const criado = await criarCadastro({
        tipo: tipoAtivo,
        codigo: proximoCodigo,
        valor: novoValor.trim().toUpperCase(),
      })
      setLista(l => [...l, { id: criado.id, codigo: criado.codigo, valor: criado.valor, ativo: criado.ativo }])
      setNovoValor('')
      setAdicionando(false)
      mostrarToast(`${config.label} Nº${proximoCodigo} adicionado!`)
    } catch (e: any) {
      mostrarToast(e?.response?.data?.erro || 'Erro ao salvar cadastro')
    } finally {
      setSalvando(false)
    }
  }

  async function toggleAtivo(item: Cadastro) {
    const novoStatus = !item.ativo
    // Atualiza otimisticamente na tela
    setLista(l => l.map(x => x.id === item.id ? { ...x, ativo: novoStatus } : x))
    try {
      await atualizarCadastro(item.id, { ativo: novoStatus })
    } catch {
      // Reverte se der erro
      setLista(l => l.map(x => x.id === item.id ? { ...x, ativo: !novoStatus } : x))
      mostrarToast('Erro ao atualizar — tente novamente')
    }
  }

  function iniciarEdicao(item: Cadastro) {
    setEditandoId(item.id)
    setEditandoValor(item.valor)
  }

  async function salvarEdicao(id: string) {
    if (!editandoValor.trim()) {
      setEditandoId(null)
      return
    }
    const valorNovo = editandoValor.trim().toUpperCase()
    setLista(l => l.map(x => x.id === id ? { ...x, valor: valorNovo } : x))
    setEditandoId(null)
    try {
      await atualizarCadastro(id, { valor: valorNovo })
      mostrarToast('Cadastro atualizado!')
    } catch {
      mostrarToast('Erro ao atualizar — tente novamente')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', height: 44,
    padding: '0 14px', borderRadius: 10,
    border: `1px solid ${border}`, background: inputBg,
    color: text, fontSize: 15, outline: 'none', fontFamily: 'inherit'
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: bg, padding: '14px 14px 32px' }}>

      {/* Abas de tipo */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 18, flexWrap: 'wrap' }}>
        {(Object.keys(tiposConfig) as TipoCadastro[]).map(tipo => {
          const ativo = tipoAtivo === tipo
          const cfg = tiposConfig[tipo]
          return (
            <button
              key={tipo}
              onClick={() => { setTipoAtivo(tipo); setAdicionando(false); setNovoValor('') }}
              style={{
                padding: '7px 14px', borderRadius: 20,
                border: `1.5px solid ${ativo ? cfg.cor : border}`,
                background: ativo ? (dark ? cfg.bg : cfg.cor + '18') : 'transparent',
                color: ativo ? cfg.cor : muted,
                fontSize: 12.5, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s'
              }}
            >
              {cfg.label}
            </button>
          )
        })}
      </div>

      {/* Header da seção */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: text }}>{config.label}s</div>
          <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>
            Digite o número para preencher automaticamente
          </div>
        </div>
        {!adicionando && (
          <button
            onClick={() => setAdicionando(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', border: 'none', borderRadius: 11, background: config.cor, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo
          </button>
        )}
      </div>

      {/* Formulário adicionar */}
      {adicionando && (
        <div style={{ background: surface, border: `1.5px solid ${config.cor}`, borderRadius: 16, padding: 16, boxShadow: shadow, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: muted, fontWeight: 700, marginBottom: 10 }}>
            Novo cadastro · Código <span style={{ color: config.cor, fontWeight: 800 }}>#{proximoCodigo}</span>
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            <input
              value={novoValor}
              onChange={e => setNovoValor(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && adicionar()}
              placeholder={`Nome do/da ${config.label.toLowerCase()}...`}
              autoFocus
              style={{ ...inputStyle, flex: 1, textTransform: 'uppercase' }}
            />
            <button
              onClick={adicionar}
              disabled={salvando}
              style={{ height: 44, padding: '0 16px', border: 'none', borderRadius: 10, background: config.cor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: salvando ? 0.7 : 1, whiteSpace: 'nowrap' }}
            >
              {salvando ? '...' : 'Salvar'}
            </button>
            <button
              onClick={() => { setAdicionando(false); setNovoValor('') }}
              style={{ height: 44, padding: '0 12px', border: `1px solid ${border}`, borderRadius: 10, background: 'transparent', color: muted, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Lista de cadastros */}
      {carregando ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: muted, fontSize: 14 }}>Carregando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {lista.map(item => (
            <div key={item.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: '12px 14px', boxShadow: shadow, display: 'flex', alignItems: 'center', gap: 12, opacity: item.ativo ? 1 : 0.5 }}>

              {/* Código */}
              <div style={{ width: 38, height: 38, borderRadius: 10, background: dark ? config.bg : config.cor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: config.cor }}>#{item.codigo}</span>
              </div>

              {/* Valor editável */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {editandoId === item.id ? (
                  <input
                    value={editandoValor}
                    onChange={e => setEditandoValor(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') salvarEdicao(item.id); if (e.key === 'Escape') setEditandoId(null) }}
                    onBlur={() => salvarEdicao(item.id)}
                    autoFocus
                    style={{ ...inputStyle, height: 36, fontSize: 14, textTransform: 'uppercase' }}
                  />
                ) : (
                  <div
                    onClick={() => iniciarEdicao(item)}
                    style={{ fontSize: 14, fontWeight: 700, color: text, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    title="Clique para editar"
                  >
                    {item.valor}
                  </div>
                )}
              </div>

              {/* Toggle ativo */}
              <button
                onClick={() => toggleAtivo(item)}
                title={item.ativo ? 'Desativar' : 'Ativar'}
                style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${border}`, background: dark ? '#16252F' : '#F4F7FB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: item.ativo ? '#C0392B' : '#3E9E4E' }}
              >
                {item.ativo ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            </div>
          ))}

          {lista.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: muted, fontSize: 14 }}>
              Nenhum cadastro ainda. Clique em <strong>Novo</strong> para adicionar.
            </div>
          )}
        </div>
      )}

      {/* Legenda de uso */}
      {lista.length > 0 && (
        <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 14, background: surface, border: `1px solid ${border}`, boxShadow: shadow }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', color: muted, marginBottom: 10 }}>Como usar os atalhos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lista.slice(0, 3).map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, background: dark ? config.bg : config.cor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: config.cor, flexShrink: 0 }}>
                  {item.codigo}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: text }}>{item.valor}</span>
              </div>
            ))}
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