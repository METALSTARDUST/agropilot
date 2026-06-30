interface Props {
  dark: boolean
  onNavigate: (tela: any) => void
  nomeUsuario: string
}

const relatoriosMock = [
  { id: 342, numero: '342', data: '19/05/2026', fazenda: 'CACHOEIRA BONITA', municipio: 'IGUATEMI', piloto: 'MAURIVAN', areaTotal: '1.285,00', status: 'sincronizado' },
  { id: 341, numero: '341', data: '16/05/2026', fazenda: 'RIO AMAMBAI', municipio: 'NAVIRAÍ', piloto: 'DOUGLAS', areaTotal: '420,00', status: 'pendente' },
  { id: 340, numero: '340', data: '14/05/2026', fazenda: 'CACHOEIRA BONITA', municipio: 'IGUATEMI', piloto: 'MAURIVAN', areaTotal: '880,00', status: 'pendente' },
]

const pilotosStats = [
  { nome: 'MAURIVAN', relatorios: 18, hectares: '14.2k', cor: '#3E9E4E' },
  { nome: 'DOUGLAS', relatorios: 12, hectares: '8.8k', cor: '#4F9CE8' },
  { nome: 'MATEUS', relatorios: 7, hectares: '4.1k', cor: '#7B7DF0' },
]

function statusInfo(s: string) {
  if (s === 'sincronizado') return { color: '#2C9A3A', label: 'Enviado' }
  if (s === 'erro') return { color: '#C0392B', label: 'Erro' }
  return { color: '#E08A1E', label: 'Pendente' }
}

export default function AdminHome({ dark, onNavigate, nomeUsuario }: Props) {
  const bg = dark ? '#1B2A4A' : '#EEF1F7'
  const surface = dark ? '#101B25' : '#FFFFFF'
  const surface2 = dark ? '#16252F' : '#F4F7FB'
  const border = dark ? '#2A3F52' : '#DCE3EE'
  const text = dark ? '#EAF1F8' : '#1B2233'
  const muted = dark ? '#94AABF' : '#5C6B7E'
  const greenSoft = dark ? '#12331E' : '#E8F4EA'
  const shadow = dark ? '0 1px 3px rgba(0,0,0,.4)' : '0 1px 3px rgba(20,30,50,.08)'

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: bg, padding: '16px 14px 26px' }}>

      {/* Saudação */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: muted, fontWeight: 600 }}>{saudacao}, admin</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: text, letterSpacing: '-.01em', marginTop: 2 }}>{nomeUsuario}</div>
      </div>

      {/* KPIs 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 18 }}>
        {[
          {
            valor: '37', label: 'Total relatórios', cor: text, bgIcon: greenSoft,
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3E9E4E" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>
          },
          {
            valor: '3', label: 'Pilotos ativos', cor: '#4F9CE8', bgIcon: dark ? '#0D1E2E' : '#EBF3FC',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F9CE8" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          },
          {
            valor: '27,1k', label: 'Hectares no mês', cor: '#3E9E4E', bgIcon: greenSoft,
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3E9E4E" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22l1.5-4.5L15 6a2.1 2.1 0 0 1 3 3L6.5 20.5z"/><path d="M14 7l3 3"/></svg>
          },
          {
            valor: '2', label: 'Pendentes envio', cor: '#E08A1E', bgIcon: dark ? '#2A1E0A' : '#FEF3E2',
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E08A1E" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.2-8.6"/><polyline points="21 4 21 9 16 9"/></svg>
          },
        ].map((c, i) => (
          <div key={i} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 14, boxShadow: shadow }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: c.bgIcon, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 9 }}>{c.icon}</div>
            <div style={{ fontSize: 25, fontWeight: 800, color: c.cor, lineHeight: 1 }}>{c.valor}</div>
            <div style={{ fontSize: 11.5, color: muted, fontWeight: 600, marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Gráfico hectares por mês */}
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: '16px 14px 12px', boxShadow: shadow, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: text }}>Hectares por mês</div>
          <div style={{ fontSize: 11.5, color: muted, fontWeight: 600 }}>Últimos 6 meses</div>
        </div>
        <svg viewBox="0 0 320 168" width="100%" style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id="barGAdmin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5DBE6D"/>
              <stop offset="1" stopColor="#3E9E4E"/>
            </linearGradient>
          </defs>
          <line x1="14" y1="140" x2="314" y2="140" stroke={border} strokeWidth="1"/>
          {[
            { x: 22, y: 60, h: 80, label: 'jan', val: '3,2k', ativo: false },
            { x: 70, y: 70, h: 70, label: 'fev', val: '2,8k', ativo: false },
            { x: 118, y: 38, h: 102, label: 'mar', val: '4,1k', ativo: false },
            { x: 166, y: 50, h: 90, label: 'abr', val: '3,6k', ativo: false },
            { x: 214, y: 30, h: 110, label: 'mai', val: '4,4k', ativo: false },
            { x: 262, y: 20, h: 120, label: 'jun', val: '4,8k', ativo: true },
          ].map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={b.y} width="30" height={b.h} rx="6" fill={b.ativo ? 'url(#barGAdmin)' : surface2}/>
              <text x={b.x + 15} y="155" textAnchor="middle" fontSize="11" fontWeight={b.ativo ? 800 : 600} fill={b.ativo ? '#3E9E4E' : muted} fontFamily="sans-serif">{b.label}</text>
              <text x={b.x + 15} y={b.y - 4} textAnchor="middle" fontSize="10.5" fontWeight={b.ativo ? 800 : 700} fill={b.ativo ? '#3E9E4E' : muted} fontFamily="sans-serif">{b.val}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Gráfico área — relatórios por mês */}
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: '16px 14px 12px', boxShadow: shadow, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: text }}>Relatórios por mês</div>
          <div style={{ fontSize: 11.5, color: '#3E9E4E', fontWeight: 700 }}>+8% vs. mai</div>
        </div>
        <svg viewBox="0 0 320 130" width="100%" style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id="areaGAdmin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3E9E4E" stopOpacity="0.32"/>
              <stop offset="1" stopColor="#3E9E4E" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d="M35 60 L83 73 L131 38 L179 52 L227 30 L275 22 L275 110 L35 110 Z" fill="url(#areaGAdmin)"/>
          <path d="M35 60 L83 73 L131 38 L179 52 L227 30 L275 22" fill="none" stroke="#3E9E4E" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          {[[35, 60], [83, 73], [131, 38], [179, 52], [227, 30]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3.4" fill={surface} stroke="#3E9E4E" strokeWidth="2.2"/>
          ))}
          <circle cx="275" cy="22" r="4.6" fill="#3E9E4E" stroke={surface} strokeWidth="2.4"/>
          {['jan', 'fev', 'mar', 'abr', 'mai', 'jun'].map((m, i) => (
            <text key={i} x={35 + i * 48} y="126" textAnchor="middle" fontSize="11" fontWeight={i === 5 ? 800 : 600} fill={i === 5 ? '#3E9E4E' : muted} fontFamily="sans-serif">{m}</text>
          ))}
        </svg>
      </div>

      {/* Ranking pilotos */}
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: '16px 14px', boxShadow: shadow, marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: text, marginBottom: 14 }}>Ranking de pilotos</div>
        {pilotosStats.map((p, i) => {
          const pct = (p.relatorios / 18) * 100
          return (
            <div key={p.nome} style={{ marginBottom: i < pilotosStats.length - 1 ? 14 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.cor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: p.cor }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: text }}>{p.nome}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: p.cor }}>{p.hectares} ha</span>
                  <span style={{ fontSize: 11, color: muted, marginLeft: 6 }}>{p.relatorios} rel.</span>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: border, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: p.cor, width: `${pct}%` }}/>
              </div>
            </div>
          )
        })}
      </div>

      {/* Fazendas mais ativas */}
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: '16px 14px', boxShadow: shadow, marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: text, marginBottom: 12 }}>Fazendas mais ativas</div>
        {[
          { nome: 'CACHOEIRA BONITA', municipio: 'IGUATEMI', relatorios: 14, ha: '11,2k' },
          { nome: 'RIO AMAMBAI', municipio: 'NAVIRAÍ', relatorios: 8, ha: '7,4k' },
          { nome: 'SANTA RITA', municipio: 'IGUATEMI', relatorios: 5, ha: '4,1k' },
        ].map((f, i) => (
          <div key={f.nome} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 2 ? `1px solid ${border}` : 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#3E9E4E"><path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.nome}</div>
              <div style={{ fontSize: 11.5, color: muted, marginTop: 1 }}>{f.municipio}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#3E9E4E' }}>{f.ha} ha</div>
              <div style={{ fontSize: 11, color: muted }}>{f.relatorios} rel.</div>
            </div>
          </div>
        ))}
      </div>

      {/* Últimos relatórios */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: text }}>Últimos relatórios</div>
        <button onClick={() => onNavigate('salvos')} style={{ background: 'transparent', border: 'none', color: '#3E9E4E', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: 0 }}>Ver todos</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {relatoriosMock.map(r => {
          const si = statusInfo(r.status)
          return (
            <div key={r.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: '13px 14px', boxShadow: shadow, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 11, background: greenSoft, color: '#3E9E4E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#3E9E4E' }}>Nº {r.numero}</span>
                  <span style={{ color: border }}>•</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.piloto}</span>
                </div>
                <div style={{ fontSize: 11.5, color: muted, marginTop: 2 }}>{r.fazenda} · {r.data}</div>
                <div style={{ fontSize: 12, color: '#3E9E4E', fontWeight: 700, marginTop: 2 }}>{r.areaTotal} ha</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: si.color, display: 'block' }}/>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: si.color, textTransform: 'uppercase' }}>{si.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}