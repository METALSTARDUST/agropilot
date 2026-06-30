import { useState, useEffect } from 'react'
import { logout, getSessao } from '../services/auth'
import { buscarRelatorios, excluirRelatorio } from '../services/api'
import { exportarRelatorioXLSX, exportarVariosRelatoriosXLSX, exportarRelatorioPDF } from '../services/exportar'
import AdminHome from './AdminHome'
import NovoRelatorio from './NovoRelatorio'
import Usuarios from './Usuarios'
import Cadastros from './Cadastros'
import Lixeira from './Lixeira'

interface Props {
  onLogout: () => void
}

type Tela = 'home' | 'novo' | 'salvos' | 'cadastros' | 'usuarios' | 'detalhe' | 'lixeira'

function statusInfo(s: string) {
  if (s === 'synced' || s === 'sincronizado') return { color: '#2C9A3A', label: 'Enviado' }
  if (s === 'erro') return { color: '#C0392B', label: 'Erro' }
  return { color: '#E08A1E', label: 'Pendente' }
}

function normalizarRelatorio(r: any) {
  return {
    id: r.id,
    numero: r.numero_os || '',
    data: r.data_atividade ? new Date(r.data_atividade).toLocaleDateString('pt-BR') : '',
    proprietario: r.proprietario || '',
    municipio: r.municipio || '',
    fazenda: r.fazenda || '',
    tipoServico: r.tipo_servico || '',
    cultura: r.cultura || '',
    piloto: r.piloto || '',
    equipamento: r.equipamento || '',
    aeronave: r.aeronave_pr || '',
    hiTrans: r.hi_trans || '',
    hiArea: r.hi_area || '',
    hfTrans: r.hf_trans || '',
    hfArea: r.hf_area || '',
    areaTotal: r.area_total ? String(r.area_total) : '0',
    obs: r.observacoes || '',
    status: r.status_sync || 'synced',
    horarios: r.horarios_por_dia || [],
    altura: r.altura_voo || '',
    faixa: r.faixa || '',
    tecnico: r.tecnico_ajudante || '',
    vazao: r.vazao || '',
    modelo: r.modelo || '',
    angulo: r.angulo || '',
    pista: r.pista_em_uso || '',
    passadas: r.passadas || [],
  }
}

export default function Dashboard({ onLogout }: Props) {
  const [tela, setTela] = useState<Tela>('home')
  const [dark, setDark] = useState(true)
  const [perfil, setPerfil] = useState<'piloto' | 'admin'>('piloto')
  const [nomeUsuario, setNomeUsuario] = useState('PILOTO')
  const [detalheId, setDetalheId] = useState<string | null>(null)
  const [filtroPiloto, setFiltroPiloto] = useState<string | null>(null)
  const [relatoriosGlobais, setRelatoriosGlobais] = useState<any[]>([])

  const bg = dark ? '#1B2A4A' : '#EEF1F7'
  const surface = dark ? '#101B25' : '#FFFFFF'
  const border = dark ? '#2A3F52' : '#DCE3EE'
  const text = dark ? '#EAF1F8' : '#1B2233'
  const muted = dark ? '#94AABF' : '#5C6B7E'
  const greenSoft = dark ? '#12331E' : '#E8F4EA'
  const shadow = dark ? '0 1px 3px rgba(0,0,0,.4)' : '0 1px 3px rgba(20,30,50,.08)'

  useEffect(() => {
    getSessao().then(s => {
      if (s) {
        const u = s.usuario as any
        setNomeUsuario(u?.nome?.toUpperCase() || 'PILOTO')
        setPerfil(u?.perfil === 'admin' ? 'admin' : 'piloto')
        setTela('home')
      }
    })
  }, [])

  // Carrega relatórios globais para uso na TelaHome e TelaDetalhe
  useEffect(() => {
    buscarRelatorios()
      .then(dados => setRelatoriosGlobais((dados || []).map(normalizarRelatorio)))
      .catch(() => {})
  }, [tela])

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  const titulos: Record<string, [string, string]> = {
    home: ['Início', 'Resumo da sua operação'],
    novo: ['Novo relatório', 'Preencha os dados da aplicação'],
    salvos: filtroPiloto ? [`Relatórios — ${filtroPiloto}`, 'Filtrado por piloto'] : perfil === 'admin' ? ['Relatórios', 'Consulte e exporte por fazenda'] : ['Enviados', 'Seus relatórios registrados'],
    detalhe: ['Relatório', 'Detalhes da aplicação'],
    cadastros: ['Cadastros', 'Atalhos de preenchimento'],
    usuarios: ['Usuários', 'Logins de pilotos'],
    lixeira: ['Lixeira', 'Relatórios excluídos'],
  }

  const [titulo, subtitulo] = titulos[tela] || titulos.home

  async function handleLogout() {
    await logout()
    onLogout()
  }

  const Header = () => (
    <div style={{ background: '#085716', padding: '12px 16px 14px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#fff', fontSize: 19, fontWeight: 800, letterSpacing: '-.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titulo}</div>
          <div style={{ color: 'rgba(255,255,255,.66)', fontSize: 11.5, fontWeight: 500, marginTop: 1 }}>{subtitulo}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#3E9E4E', padding: '6px 11px 6px 8px', borderRadius: 20 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>
              {nomeUsuario.charAt(0)}
            </div>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, maxWidth: 70, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nomeUsuario}</span>
          </div>
          <button onClick={() => setDark(!dark)} style={{ width: 36, height: 36, border: 'none', borderRadius: 10, background: 'rgba(255,255,255,.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {dark ? (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round"><circle cx="12" cy="12" r="4.2"/><line x1="12" y1="2.5" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21.5"/><line x1="2.5" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21.5" y2="12"/><line x1="5.3" y1="5.3" x2="7" y2="7"/><line x1="17" y1="17" x2="18.7" y2="18.7"/><line x1="5.3" y1="18.7" x2="7" y2="17"/><line x1="17" y1="7" x2="18.7" y2="5.3"/></svg>
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <button onClick={handleLogout} style={{ width: 36, height: 36, border: 'none', borderRadius: 10, background: 'rgba(255,255,255,.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9"/><path d="M15 8l4 4-4 4"/><line x1="19" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </div>
  )

  const NavBtn = ({ id, label, icon }: { id: Tela; label: string; icon: React.ReactNode }) => {
    const ativo = tela === id || (id === 'salvos' && tela === 'detalhe')
    return (
      <button onClick={() => setTela(id)} style={{ flex: 1, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 0', color: ativo ? '#3E9E4E' : muted }}>
        <div style={{ width: 46, height: 30, borderRadius: 16, background: ativo ? greenSoft : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}>{icon}</div>
        <span style={{ fontSize: 10.5, fontWeight: 700 }}>{label}</span>
      </button>
    )
  }

  const iconeRelatorios = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.6" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="3.6" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="3.6" cy="18" r="1.3" fill="currentColor" stroke="none"/></svg>
  const iconeCadastros = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
  const iconeUsuarios = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  const iconeHome = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>
  const iconeNovo = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
  const iconeLixeira = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>

  const BottomNav = () => (
    <div style={{ background: surface, borderTop: `1px solid ${border}`, display: 'flex', padding: '8px 6px 10px', flexShrink: 0 }}>
      {perfil === 'admin' ? (
        <>
          <NavBtn id="home" label="Home" icon={iconeHome} />
          <NavBtn id="novo" label="Novo" icon={iconeNovo} />
          <NavBtn id="salvos" label="Relatórios" icon={iconeRelatorios} />
          <NavBtn id="usuarios" label="Usuários" icon={iconeUsuarios} />
          <NavBtn id="cadastros" label="Cadastros" icon={iconeCadastros} />
          <NavBtn id="lixeira" label="Lixeira" icon={iconeLixeira} />
        </>
      ) : (
        <>
          <NavBtn id="home" label="Home" icon={iconeHome} />
          <NavBtn id="novo" label="Novo" icon={iconeNovo} />
          <NavBtn id="salvos" label="Enviados" icon={iconeRelatorios} />
          <NavBtn id="cadastros" label="Cadastros" icon={iconeCadastros} />
        </>
      )}
    </div>
  )

  // ── TELA HOME ─────────────────────────────────────────────────
  const TelaHome = () => {
    const meusPiloto = relatoriosGlobais.filter(r =>
      perfil === 'piloto' ? r.piloto?.toUpperCase() === nomeUsuario : true
    )
    const last3 = meusPiloto.slice(0, 3)
    const lastFarm = meusPiloto[0]
    const totalHa = meusPiloto.reduce((a, r) => a + (parseFloat(String(r.areaTotal).replace(/\./g, '').replace(',', '.')) || 0), 0)
    const pendentes = meusPiloto.filter(r => r.status !== 'synced' && r.status !== 'sincronizado').length

    return (
      <div style={{ flex: 1, overflowY: 'auto', background: bg, padding: '16px 14px 26px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: muted, fontWeight: 600 }}>{saudacao}, piloto</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: text, letterSpacing: '-.01em', marginTop: 2 }}>{nomeUsuario}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 18 }}>
          {[
            { valor: String(meusPiloto.length), label: 'Relatórios enviados', cor: text, bgI: greenSoft, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3E9E4E" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg> },
            { valor: totalHa >= 1000 ? (totalHa / 1000).toFixed(1).replace('.', ',') + 'k' : String(Math.round(totalHa)), label: 'Hectares total', cor: text, bgI: greenSoft, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3E9E4E" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22l1.5-4.5L15 6a2.1 2.1 0 0 1 3 3L6.5 20.5z"/><path d="M14 7l3 3"/></svg> },
            { valor: meusPiloto.filter(r => r.status === 'synced' || r.status === 'sincronizado').length.toString(), label: 'Sincronizados', cor: '#3E9E4E', bgI: greenSoft, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3E9E4E" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
            { valor: String(pendentes), label: 'Pendentes de envio', cor: '#E08A1E', bgI: dark ? '#2A1E0A' : '#FEF3E2', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E08A1E" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.2-8.6"/><polyline points="21 4 21 9 16 9"/></svg> },
          ].map((c, i) => (
            <div key={i} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 14, boxShadow: shadow }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: c.bgI, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 9 }}>{c.icon}</div>
              <div style={{ fontSize: 25, fontWeight: 800, color: c.cor, lineHeight: 1 }}>{c.valor}</div>
              <div style={{ fontSize: 11.5, color: muted, fontWeight: 600, marginTop: 4 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {lastFarm && (
          <div style={{ background: '#2A8F3A', borderRadius: 16, padding: 16, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
            <svg width="120" height="120" viewBox="0 0 24 24" fill="rgba(255,255,255,.05)" style={{ position: 'absolute', right: -16, bottom: -22 }}><path d="M2 13.5l9-2.2V4.6c0-.9.7-1.6 1.5-1.6S14 3.7 14 4.6v6.2l8 1.9v2.1l-8-1.5v4.6l2.4 1.6v1.6L12 20.2l-4.4 1.5v-1.6L10 18.5v-4.6l-8 1.5v-1.9z"/></svg>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}>Última fazenda</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 3 }}>{lastFarm.fazenda || '—'}</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)', fontWeight: 500, marginTop: 1 }}>{lastFarm.municipio || '—'} · MS</div>
            <div style={{ display: 'flex', gap: 22, marginTop: 14 }}>
              {[['Relatório', `Nº ${lastFarm.numero}`], ['Área', `${lastFarm.areaTotal} ha`], ['Data', lastFarm.data]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.55)', fontWeight: 700, textTransform: 'uppercase' }}>{l}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginTop: 1 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: '#2A8F3A', borderRadius: 16, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Precisa de ajuda?</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>Fale com o suporte da VGR</div>
          </div>
          <a href="https://wa.me/5567999999999" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, background: '#25D366', color: '#fff', fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            WhatsApp
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: text }}>Últimos relatórios</div>
          <button onClick={() => setTela('salvos')} style={{ background: 'transparent', border: 'none', color: '#3E9E4E', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: 0 }}>Ver todos</button>
        </div>

        {last3.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: muted, fontSize: 14 }}>
            Nenhum relatório ainda. Crie o primeiro!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {last3.map(r => {
              const si = statusInfo(r.status)
              return (
                <div key={r.id} onClick={() => { setDetalheId(r.id); setTela('detalhe') }} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: '13px 14px', boxShadow: shadow, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 11, background: greenSoft, color: '#3E9E4E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.fazenda || '—'}</div>
                    <div style={{ fontSize: 11.5, color: muted, marginTop: 2 }}>{r.data} · {r.areaTotal} ha</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 14, background: dark ? '#15222E' : '#F1F5FA' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: si.color, display: 'block' }}/>
                    <span style={{ fontSize: 11, fontWeight: 700, color: si.color }}>{si.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── TELA SALVOS ───────────────────────────────────────────────
  const TelaSalvos = () => {
    const [listaReal, setListaReal] = useState<any[]>([])
    const [carregando, setCarregando] = useState(true)

    useEffect(() => {
      buscarRelatorios(filtroPiloto ? { piloto: filtroPiloto } : undefined)
        .then(dados => setListaReal((dados || []).map(normalizarRelatorio)))
        .catch(() => setListaReal([]))
        .finally(() => setCarregando(false))
    }, [])

    const grupos: Record<string, any[]> = {}
    listaReal.forEach(r => { (grupos[r.fazenda || 'Sem fazenda'] = grupos[r.fazenda || 'Sem fazenda'] || []).push(r) })
    const statArea = listaReal.reduce((a, r) => a + (parseFloat(String(r.areaTotal).replace(/\./g, '').replace(',', '.')) || 0), 0)
    const statAreaFmt = statArea >= 1000 ? (statArea / 1000).toFixed(1).replace('.', ',') + 'k' : String(Math.round(statArea))

    return (
      <div style={{ flex: 1, overflowY: 'auto', background: bg, padding: '14px 14px 26px' }}>
        {filtroPiloto && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <button onClick={() => setFiltroPiloto(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', border: `1px solid ${border}`, borderRadius: 18, background: 'transparent', color: muted, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Todos os relatórios
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#3E9E4E' }}>Piloto: {filtroPiloto}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[['Relatórios', String(listaReal.length), text], ['Pendentes', String(listaReal.filter(r => r.status !== 'synced' && r.status !== 'sincronizado').length), '#E08A1E'], ['Total ha', statAreaFmt, '#3E9E4E']].map(([l, v, c]) => (
            <div key={l} style={{ flex: 1, background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: '13px 14px', boxShadow: shadow }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: 11.5, color: muted, fontWeight: 600, marginTop: 1 }}>{l}</div>
            </div>
          ))}
        </div>

        {carregando ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: muted }}>Carregando...</div>
        ) : listaReal.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: muted, fontSize: 14 }}>Nenhum relatório encontrado.</div>
        ) : (
          Object.entries(grupos).map(([fazenda, items]) => (
            <div key={fazenda} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#3E9E4E"><path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"/></svg>
                <span style={{ fontSize: 14, fontWeight: 800, color: text }}>{fazenda}</span>
                <span style={{ fontSize: 11.5, color: muted, fontWeight: 600 }}>· {items.length} relatório(s)</span>
                <button onClick={() => exportarVariosRelatoriosXLSX(items, fazenda)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', border: `1px solid #3E9E4E`, borderRadius: 14, background: 'transparent', color: '#3E9E4E', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', marginLeft: 'auto' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  XLSX
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(r => {
                  const si = statusInfo(r.status)
                  return (
                    <div key={r.id} onClick={() => { setDetalheId(r.id); setTela('detalhe') }} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: '13px 14px', boxShadow: shadow, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#3E9E4E' }}>Nº {r.numero}</span>
                          <span style={{ color: border }}>•</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.piloto}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: muted, marginTop: 3 }}>{r.municipio} · {r.data}</div>
                        <div style={{ fontSize: 12, color: '#3E9E4E', fontWeight: 700, marginTop: 3 }}>{r.areaTotal} ha</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: si.color, display: 'block' }}/>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: si.color, textTransform: 'uppercase' }}>{si.label}</span>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  // ── TELA DETALHE ──────────────────────────────────────────────
  const TelaDetalhe = () => {
    const r = relatoriosGlobais.find(x => x.id === detalheId)

    if (!r) {
      return (
        <div style={{ flex: 1, background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <div style={{ color: muted, fontSize: 14 }}>Relatório não encontrado</div>
          <button onClick={() => setTela('salvos')} style={{ padding: '10px 20px', border: 'none', borderRadius: 12, background: '#3E9E4E', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Voltar
          </button>
        </div>
      )
    }

    const si = statusInfo(r.status)
    return (
      <div style={{ flex: 1, overflowY: 'auto', background: bg, padding: '14px 14px 26px' }}>
        <button onClick={() => setTela('salvos')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0', border: 'none', background: 'transparent', color: muted, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Voltar
        </button>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 16, boxShadow: shadow, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: muted }}>Relatório Nº</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#3E9E4E', lineHeight: 1.05, marginTop: 2 }}>{r.numero}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: dark ? '#15222E' : '#F1F5FA', color: si.color }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: si.color, display: 'block' }}/>{si.label}
            </div>
          </div>
          <div style={{ height: 1, background: border, margin: '14px 0' }}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '13px 14px' }}>
            {[['Proprietário', r.proprietario], ['Data', r.data], ['Município', r.municipio], ['Fazenda', r.fazenda], ['Tipo de serviço', r.tipoServico], ['Cultura', r.cultura], ['Piloto', r.piloto], ['Aeronave', r.aeronave], ['Equipamento', r.equipamento]].map(([l, v], i) => (
              <div key={l} style={i === 4 ? { gridColumn: '1 / -1' } : {}}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: muted }}>{l}</div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: text, marginTop: 2 }}>{v || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '18px 0 10px' }}>
          <span style={{ width: 4, height: 16, borderRadius: 2, background: '#3E9E4E', display: 'block' }}/>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', color: text, textTransform: 'uppercase' }}>Horímetro</span>
        </div>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: '6px 16px', boxShadow: shadow, marginBottom: 16 }}>
          {[['HI Trans', r.hiTrans], ['HI Área', r.hiArea], ['HF Área', r.hfArea], ['HF Trans', r.hfTrans]].map(([l, v], i, arr) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}>
              <span style={{ fontSize: 13, color: muted, fontWeight: 600 }}>{l}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: text }}>{v || '—'}</span>
            </div>
          ))}
        </div>

        {r.passadas && r.passadas.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '18px 0 10px' }}>
              <span style={{ width: 4, height: 16, borderRadius: 2, background: '#3E9E4E', display: 'block' }}/>
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', color: text, textTransform: 'uppercase' }}>Controle por Passada</span>
            </div>
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: '6px 16px', boxShadow: shadow, marginBottom: 16 }}>
              {r.passadas.map((p: any, i: number, arr: any[]) => (
                <div key={p.passada ?? i} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}>
                  <span style={{ fontSize: 13, color: muted, fontWeight: 600 }}>Passada {p.passada}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: text }}>{p.horimetro || '—'}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, padding: '16px 18px', borderRadius: 14, background: greenSoft, border: `1px solid #3E9E4E` }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: '#3E9E4E' }}>Área total</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#3E9E4E' }}>{r.areaTotal} ha</div>
        </div>

        {perfil === 'admin' && (
          <button
            onClick={async () => {
              if (confirm(`Mover o relatório Nº ${r.numero} para a lixeira?`)) {
                try {
                  await excluirRelatorio(r.id)
                  setTela('salvos')
                } catch {
                  alert('Erro ao excluir relatório')
                }
              }
            }}
            style={{ width: '100%', height: 46, marginTop: 12, border: `1px solid #C0392B`, borderRadius: 13, background: 'transparent', color: '#C0392B', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
            Mover para lixeira
          </button>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={() => exportarRelatorioXLSX({ numero: r.numero, data: r.data, proprietario: r.proprietario, municipio: r.municipio, fazenda: r.fazenda, tipoServico: r.tipoServico, cultura: r.cultura, altura: r.altura, faixa: r.faixa, piloto: r.piloto, equipamento: r.equipamento, tecnico: r.tecnico, vazao: r.vazao, aeronave: r.aeronave, modelo: r.modelo, angulo: r.angulo, hiTrans: r.hiTrans, hiArea: r.hiArea, hfTrans: r.hfTrans, hfArea: r.hfArea, areaTotal: r.areaTotal, obs: r.obs, horarios: r.horarios, passadas: r.passadas })} style={{ flex: 1, height: 50, border: 'none', borderRadius: 13, background: '#3E9E4E', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            XLSX
          </button>
          <button onClick={() => exportarRelatorioPDF({ numero: r.numero, data: r.data, proprietario: r.proprietario, municipio: r.municipio, fazenda: r.fazenda, tipoServico: r.tipoServico, cultura: r.cultura, altura: r.altura, faixa: r.faixa, piloto: r.piloto, equipamento: r.equipamento, tecnico: r.tecnico, vazao: r.vazao, aeronave: r.aeronave, modelo: r.modelo, angulo: r.angulo, hiTrans: r.hiTrans, hiArea: r.hiArea, hfTrans: r.hfTrans, hfArea: r.hfArea, areaTotal: r.areaTotal, obs: r.obs, horarios: r.horarios, passadas: r.passadas })} style={{ flex: 1, height: 50, border: `1.4px solid #283E55`, borderRadius: 13, background: 'transparent', color: dark ? '#EAF1F8' : '#283E55', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            PDF
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <Header />
      {tela === 'home' && (perfil === 'admin' ? <AdminHome dark={dark} onNavigate={setTela} nomeUsuario={nomeUsuario} /> : <TelaHome />)}
      {tela === 'novo' && <NovoRelatorio dark={dark} nomeUsuario={nomeUsuario} onSalvar={() => setTela('salvos')} />}
      {tela === 'salvos' && <TelaSalvos />}
      {tela === 'detalhe' && <TelaDetalhe />}
      {tela === 'cadastros' && <Cadastros dark={dark} />}
      {tela === 'usuarios' && <Usuarios dark={dark} onVerRelatorios={(piloto) => { setFiltroPiloto(piloto); setTela('salvos') }} />}
      {tela === 'lixeira' && perfil === 'admin' && <Lixeira dark={dark} />}
      <BottomNav />
    </div>
  )
}