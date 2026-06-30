import { useState, useEffect, useRef } from 'react'
import { buscarProximoNumero, buscarCadastros } from '../services/api'
import { salvarRelatorioComOffline, estaOnline } from '../services/sync'

interface Props {
  dark: boolean
  nomeUsuario: string
  onSalvar: () => void
}

interface Horario {
  dia: string
  inicio: string
  final: string
}

interface FormData {
  numero: string
  os: string
  data: string
  proprietario: string
  municipio: string
  fazenda: string
  pista: string
  tipoServico: string
  cultura: string
  altura: string
  faixa: string
  piloto: string
  equipamento: string
  tecnico: string
  vazao: string
  aeronave: string
  modelo: string
  angulo: string
  hiTrans: string
  hiArea: string
  hfTrans: string
  hfArea: string
  areaTotal: string
  obs: string
}

const cadastrosMock: Record<string, Record<string, string>> = {
  fazenda: { '1': 'CACHOEIRA BONITA', '2': 'RIO AMAMBAI', '3': 'SANTA RITA' },
  municipio: { '1': 'IGUATEMI', '2': 'NAVIRAÍ', '3': 'AMAMBAI' },
  piloto: { '1': 'MAURIVAN', '2': 'DOUGLAS', '3': 'MATEUS' },
  cultura: { '1': 'CANA', '2': 'SOJA', '3': 'MILHO' },
  aeronave: { '1': 'PR-NSM', '2': 'PR-VGR' },
  tipoServico: { '1': 'FERTILIZANTE FOLIAR', '2': 'INSETICIDA', '3': 'HERBICIDA' },
  proprietario: { '1': 'RAA' },
}

function resolverAtalho(
  mapaReal: Record<string, Record<string, string>>,
  campo: keyof typeof cadastrosMock,
  valor: string
): string {
  // Primeiro tenta resolver com os dados reais do banco (cadastrados pelo app)
  const realDoTipo = mapaReal[campo]
  if (realDoTipo && realDoTipo[valor]) return realDoTipo[valor]

  // Se não achou (cadastro ainda não existe, ou app sem internet), usa a lista de reserva
  const mockDoTipo = cadastrosMock[campo]
  if (mockDoTipo && mockDoTipo[valor]) return mockDoTipo[valor]

  return valor
}

export default function NovoRelatorio({ dark, nomeUsuario, onSalvar }: Props) {
  const bg = dark ? '#1B2A4A' : '#EEF1F7'
  const surface = dark ? '#101B25' : '#FFFFFF'
  const border = dark ? '#2A3F52' : '#DCE3EE'
  const text = dark ? '#EAF1F8' : '#1B2233'
  const muted = dark ? '#94AABF' : '#5C6B7E'
  const inputBg = dark ? '#172A38' : '#FBFCFE'
  const greenSoft = dark ? '#12331E' : '#E8F4EA'
  const shadow = dark ? '0 1px 3px rgba(0,0,0,.4)' : '0 1px 3px rgba(20,30,50,.08)'

  const hoje = new Date().toLocaleDateString('pt-BR')

  const rOs = useRef<HTMLInputElement>(null)
  const rData = useRef<HTMLInputElement>(null)
  const rProprietario = useRef<HTMLInputElement>(null)
  const rMunicipio = useRef<HTMLInputElement>(null)
  const rFazenda = useRef<HTMLInputElement>(null)
  const rPista = useRef<HTMLInputElement>(null)
  const rTipoServico = useRef<HTMLInputElement>(null)
  const rCultura = useRef<HTMLInputElement>(null)
  const rAltura = useRef<HTMLInputElement>(null)
  const rFaixa = useRef<HTMLInputElement>(null)
  const rPiloto = useRef<HTMLInputElement>(null)
  const rEquipamento = useRef<HTMLInputElement>(null)
  const rTecnico = useRef<HTMLInputElement>(null)
  const rVazao = useRef<HTMLInputElement>(null)
  const rAeronave = useRef<HTMLInputElement>(null)
  const rModelo = useRef<HTMLInputElement>(null)
  const rAngulo = useRef<HTMLInputElement>(null)
  const rHiTrans = useRef<HTMLInputElement>(null)
  const rHiArea = useRef<HTMLInputElement>(null)
  const rHfTrans = useRef<HTMLInputElement>(null)
  const rHfArea = useRef<HTMLInputElement>(null)
  const rAreaTotal = useRef<HTMLInputElement>(null)
  const rObs = useRef<HTMLTextAreaElement>(null)

  const [form, setForm] = useState<FormData>({
    numero: '000', os: '', data: hoje,
    proprietario: '', municipio: '', fazenda: '', pista: '',
    tipoServico: '', cultura: '', altura: '', faixa: '',
    piloto: nomeUsuario, equipamento: '', tecnico: '', vazao: '',
    aeronave: '', modelo: '', angulo: '',
    hiTrans: '', hiArea: '', hfTrans: '', hfArea: '',
    areaTotal: '', obs: ''
  })

  const [horarios, setHorarios] = useState<Horario[]>([{ dia: '', inicio: '', final: '' }])
  const [passadas, setPassadas] = useState<string[]>([''])
  const passadaRefs = useRef<(HTMLInputElement | null)[]>([])
  const [salvando, setSalvando] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [cadastrosReais, setCadastrosReais] = useState<Record<string, Record<string, string>>>({})

  useEffect(() => {
    buscarProximoNumero().then(num => setField('numero', num))
  }, [])

  // Carrega os cadastros reais do banco (criados pelo admin na aba Cadastros)
  // e monta um mapa { tipo: { codigo: valor } } pra resolver os atalhos numéricos
  useEffect(() => {
    buscarCadastros()
      .then((lista: any[]) => {
        const mapa: Record<string, Record<string, string>> = {}
        for (const item of lista || []) {
          if (!mapa[item.tipo]) mapa[item.tipo] = {}
          mapa[item.tipo][String(item.codigo)] = item.valor
        }
        setCadastrosReais(mapa)
      })
      .catch(() => {
        // Sem internet ou erro na busca — segue só com a lista de reserva (cadastrosMock)
      })
  }, [])

  function mostrarToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }

  function setField(key: keyof FormData, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function setFieldComAtalho(key: keyof FormData, campoAtalho: keyof typeof cadastrosMock, value: string) {
    const resolvido = resolverAtalho(cadastrosReais, campoAtalho, value.trim())
    setForm(f => ({ ...f, [key]: resolvido }))
  }

  function atualizarHorario(idx: number, campo: keyof Horario, valor: string) {
    setHorarios(h => h.map((item, i) => i === idx ? { ...item, [campo]: valor } : item))
  }

  function adicionarHorario() {
    setHorarios(h => [...h, { dia: '', inicio: '', final: '' }])
  }

  function removerHorario(idx: number) {
    setHorarios(h => h.filter((_, i) => i !== idx))
  }

  function atualizarPassada(idx: number, valor: string) {
    setPassadas(p => p.map((v, i) => i === idx ? valor : v))
  }

  function handlePassadaKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()

    const ehUltima = idx === passadas.length - 1
    const valorAtual = passadas[idx].trim()

    if (ehUltima) {
      if (!valorAtual) return // não cria linha nova se a atual estiver vazia
      setPassadas(p => [...p, ''])
      setTimeout(() => passadaRefs.current[idx + 1]?.focus(), 0)
    } else {
      passadaRefs.current[idx + 1]?.focus()
    }
  }

  function removerPassada(idx: number) {
    setPassadas(p => (p.length > 1 ? p.filter((_, i) => i !== idx) : p))
  }

  function ir(ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement>) {
    ref.current?.focus()
  }

  async function salvar() {
    if (!form.proprietario && !form.fazenda) {
      mostrarToast('Preencha proprietário e fazenda')
      return
    }
    setSalvando(true)
    try {
      // Só envia as passadas que realmente foram preenchidas (ignora linhas vazias)
      const passadasPreenchidas = passadas
        .map((valor, idx) => ({ passada: idx + 1, horimetro: valor.trim() }))
        .filter(p => p.horimetro !== '')

      const resultado = await salvarRelatorioComOffline({
        numero_os: form.numero,
        data_atividade: form.data.split('/').reverse().join('-'),
        proprietario: form.proprietario,
        municipio: form.municipio,
        fazenda: form.fazenda,
        pista_em_uso: form.pista,
        tipo_servico: form.tipoServico,
        cultura: form.cultura,
        altura_voo: form.altura,
        faixa: form.faixa,
        piloto: form.piloto,
        equipamento: form.equipamento,
        tecnico_ajudante: form.tecnico,
        vazao: form.vazao,
        aeronave_pr: form.aeronave,
        modelo: form.modelo,
        angulo: form.angulo,
        hi_trans: form.hiTrans,
        hi_area: form.hiArea,
        hf_trans: form.hfTrans,
        hf_area: form.hfArea,
        area_total: parseFloat(form.areaTotal.replace(/\./g, '').replace(',', '.')) || 0,
        horarios_por_dia: horarios,
        passadas: passadasPreenchidas,
        observacoes: form.obs,
      })
      if (resultado.sincronizado) {
        mostrarToast(`Relatório Nº ${form.numero} salvo e enviado!`)
      } else {
        mostrarToast(`Relatório Nº ${form.numero} salvo localmente — pendente de sincronização`)
      }
      setTimeout(() => onSalvar(), 1200)
    } catch (e: any) {
      mostrarToast('Erro ao salvar relatório')
    } finally {
      setSalvando(false)
    }
  }

  const iStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', height: 44,
    padding: '0 12px', borderRadius: 10,
    border: `1px solid ${border}`, background: inputBg,
    color: text, fontSize: 15, outline: 'none', fontFamily: 'inherit'
  }

  const Lbl = ({ children }: { children: string }) => (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: muted, margin: '0 0 5px 2px' }}>{children}</label>
  )

  const Sec = ({ titulo }: { titulo: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 11px' }}>
      <span style={{ width: 4, height: 16, borderRadius: 2, background: '#3E9E4E', display: 'block' }}/>
      <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', color: text, textTransform: 'uppercase' }}>{titulo}</span>
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: bg, padding: '14px 14px 32px', position: 'relative' }}>

      {/* Cabeçalho */}
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 16, boxShadow: shadow, marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: muted }}>Relatório Nº</div>
            <input
              value={form.numero}
              onChange={e => setField('numero', e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && ir(rOs)}
              inputMode="numeric"
              maxLength={6}
              style={{ fontSize: 30, fontWeight: 800, color: '#3E9E4E', lineHeight: 1.05, marginTop: 2, background: 'transparent', border: 'none', outline: 'none', width: 120, padding: 0, fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: estaOnline() ? (dark ? '#12331E' : '#E8F4EA') : (dark ? '#2A1E0A' : '#FEF3E2'), color: estaOnline() ? '#3E9E4E' : '#B5740F', padding: '7px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: estaOnline() ? '#3E9E4E' : '#E08A1E', display: 'block' }}/>
            {estaOnline() ? 'Online' : 'Offline'}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
          <div>
            <Lbl>O.S.</Lbl>
            <input ref={rOs} value={form.os} onChange={e => setField('os', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rData)} placeholder="—" style={iStyle} />
          </div>
          <div>
            <Lbl>Data</Lbl>
            <input ref={rData} value={form.data} onChange={e => setField('data', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rProprietario)} placeholder="DD/MM/AAAA" style={iStyle} />
          </div>
        </div>
      </div>

      {/* IDENTIFICAÇÃO */}
      <Sec titulo="Identificação" />
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 16, boxShadow: shadow, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <Lbl>Proprietário</Lbl>
          <input ref={rProprietario} value={form.proprietario} onChange={e => setField('proprietario', e.target.value)} onBlur={e => setFieldComAtalho('proprietario', 'proprietario', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rMunicipio)} placeholder="Nome ou nº" style={{ ...iStyle, textTransform: 'uppercase' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <Lbl>Município</Lbl>
            <input ref={rMunicipio} value={form.municipio} onChange={e => setField('municipio', e.target.value)} onBlur={e => setFieldComAtalho('municipio', 'municipio', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rFazenda)} placeholder="Nome ou nº" style={{ ...iStyle, textTransform: 'uppercase' }} />
          </div>
          <div>
            <Lbl>Fazenda</Lbl>
            <input ref={rFazenda} value={form.fazenda} onChange={e => setField('fazenda', e.target.value)} onBlur={e => setFieldComAtalho('fazenda', 'fazenda', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rPista)} placeholder="Nome ou nº" style={{ ...iStyle, textTransform: 'uppercase' }} />
          </div>
        </div>
        <div>
          <Lbl>Pista em uso</Lbl>
          <input ref={rPista} value={form.pista} onChange={e => setField('pista', e.target.value)} onBlur={e => setField('pista', e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && ir(rTipoServico)} style={{ ...iStyle, textTransform: 'uppercase' }} />
        </div>
        <div>
          <Lbl>Tipo de serviço</Lbl>
          <input ref={rTipoServico} value={form.tipoServico} onChange={e => setField('tipoServico', e.target.value)} onBlur={e => setFieldComAtalho('tipoServico', 'tipoServico', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rCultura)} placeholder="Ex.: Fertilizante foliar ou nº" style={{ ...iStyle, textTransform: 'uppercase' }} />
        </div>
      </div>

      {/* OPERAÇÃO */}
      <Sec titulo="Operação" />
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 16, boxShadow: shadow, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
          <div>
            <Lbl>Cultura</Lbl>
            <input ref={rCultura} value={form.cultura} onChange={e => setField('cultura', e.target.value)} onBlur={e => setFieldComAtalho('cultura', 'cultura', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rAltura)} placeholder="Nome ou nº" style={{ ...iStyle, textTransform: 'uppercase' }} />
          </div>
          <div>
            <Lbl>Altura</Lbl>
            <input ref={rAltura} value={form.altura} onChange={e => setField('altura', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rFaixa)} inputMode="numeric" style={{ ...iStyle, textAlign: 'center' }} />
          </div>
          <div>
            <Lbl>Faixa</Lbl>
            <input ref={rFaixa} value={form.faixa} onChange={e => setField('faixa', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rPiloto)} inputMode="numeric" style={{ ...iStyle, textAlign: 'center' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <Lbl>Piloto</Lbl>
            <input ref={rPiloto} value={form.piloto} onChange={e => setField('piloto', e.target.value)} onBlur={e => setFieldComAtalho('piloto', 'piloto', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rEquipamento)} placeholder="Nome ou nº" style={{ ...iStyle, textTransform: 'uppercase' }} />
          </div>
          <div>
            <Lbl>Equipamento</Lbl>
            <input ref={rEquipamento} value={form.equipamento} onChange={e => setField('equipamento', e.target.value)} onBlur={e => setField('equipamento', e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && ir(rTecnico)} placeholder="Barra / Bico" style={{ ...iStyle, textTransform: 'uppercase' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
          <div>
            <Lbl>Téc./Ajudante</Lbl>
            <input ref={rTecnico} value={form.tecnico} onChange={e => setField('tecnico', e.target.value)} onBlur={e => setField('tecnico', e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && ir(rVazao)} style={{ ...iStyle, textTransform: 'uppercase' }} />
          </div>
          <div>
            <Lbl>Vazão</Lbl>
            <input ref={rVazao} value={form.vazao} onChange={e => setField('vazao', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rAeronave)} inputMode="numeric" style={{ ...iStyle, textAlign: 'center' }} />
          </div>
        </div>
      </div>

      {/* AERONAVE */}
      <Sec titulo="Aeronave" />
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 16, boxShadow: shadow }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr .8fr', gap: 10 }}>
          <div>
            <Lbl>Aeronave</Lbl>
            <input ref={rAeronave} value={form.aeronave} onChange={e => setField('aeronave', e.target.value)} onBlur={e => setFieldComAtalho('aeronave', 'aeronave', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rModelo)} placeholder="PR- ou nº" style={{ ...iStyle, textTransform: 'uppercase' }} />
          </div>
          <div>
            <Lbl>Modelo</Lbl>
            <input ref={rModelo} value={form.modelo} onChange={e => setField('modelo', e.target.value)} onBlur={e => setField('modelo', e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && ir(rAngulo)} style={{ ...iStyle, textTransform: 'uppercase' }} />
          </div>
          <div>
            <Lbl>Ângulo</Lbl>
            <input ref={rAngulo} value={form.angulo} onChange={e => setField('angulo', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rHiTrans)} inputMode="numeric" style={{ ...iStyle, textAlign: 'center' }} />
          </div>
        </div>
      </div>

      {/* HORÍMETRO */}
      <Sec titulo="Horímetro" />
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 16, boxShadow: shadow }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <Lbl>HI Trans</Lbl>
            <input ref={rHiTrans} value={form.hiTrans} onChange={e => setField('hiTrans', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rHiArea)} inputMode="decimal" style={{ ...iStyle, textAlign: 'center' }} />
          </div>
          <div>
            <Lbl>HI Área</Lbl>
            <input ref={rHiArea} value={form.hiArea} onChange={e => setField('hiArea', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rHfTrans)} inputMode="decimal" style={{ ...iStyle, textAlign: 'center' }} />
          </div>
          <div>
            <Lbl>HF Trans</Lbl>
            <input ref={rHfTrans} value={form.hfTrans} onChange={e => setField('hfTrans', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rHfArea)} inputMode="decimal" style={{ ...iStyle, textAlign: 'center' }} />
          </div>
          <div>
            <Lbl>HF Área</Lbl>
            <input ref={rHfArea} value={form.hfArea} onChange={e => setField('hfArea', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rAreaTotal)} inputMode="decimal" style={{ ...iStyle, textAlign: 'center' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14, padding: '14px 16px', borderRadius: 12, background: greenSoft, border: `1px solid #3E9E4E` }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: '#3E9E4E' }}>Área total (ha)</div>
          <input ref={rAreaTotal} value={form.areaTotal} onChange={e => setField('areaTotal', e.target.value)} onKeyDown={e => e.key === 'Enter' && ir(rObs)} inputMode="decimal" placeholder="0,00" style={{ width: 120, boxSizing: 'border-box', height: 42, padding: '0 12px', borderRadius: 10, border: `1.4px solid #3E9E4E`, background: surface, color: '#3E9E4E', fontSize: 19, fontWeight: 800, outline: 'none', textAlign: 'right', fontFamily: 'inherit' }} />
        </div>
      </div>

      {/* CONTROLE POR PASSADA */}
      <Sec titulo="Controle por Passada" />
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 16, boxShadow: shadow }}>
        <div style={{ fontSize: 12, color: muted, marginBottom: 12 }}>
          Leitura do horímetro a cada passada — aperte Enter pra abrir a próxima linha
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {passadas.map((valor, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 800, color: '#3E9E4E', flexShrink: 0 }}>
                {idx + 1}
              </div>
              <input
                ref={el => { passadaRefs.current[idx] = el }}
                value={valor}
                onChange={e => atualizarPassada(idx, e.target.value)}
                onKeyDown={e => handlePassadaKeyDown(idx, e)}
                placeholder="Leitura do horímetro"
                inputMode="decimal"
                style={{ ...iStyle, flex: 1 }}
              />
              {passadas.length > 1 && (
                <button onClick={() => removerPassada(idx)} style={{ width: 38, height: 38, flexShrink: 0, border: `1px solid ${border}`, borderRadius: 9, background: dark ? '#16252F' : '#F4F7FB', color: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* HORÁRIOS POR DIA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 11px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 4, height: 16, borderRadius: 2, background: '#3E9E4E', display: 'block' }}/>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', color: text, textTransform: 'uppercase' }}>Horários por dia</span>
        </div>
        <button onClick={adicionarHorario} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: `1px solid #3E9E4E`, borderRadius: 18, background: 'transparent', color: '#3E9E4E', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Adicionar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {horarios.map((h, idx) => (
          <div key={idx} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: 12, boxShadow: shadow, display: 'flex', alignItems: 'flex-end', gap: 9 }}>
            <div style={{ width: 64, flexShrink: 0 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: muted, margin: '0 0 4px 2px' }}>Dia</label>
              <input value={h.dia} onChange={e => atualizarHorario(idx, 'dia', e.target.value.replace(/\D/g, ''))} inputMode="numeric" style={{ ...iStyle, height: 42, textAlign: 'center', fontWeight: 700 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: muted, margin: '0 0 4px 2px' }}>Início</label>
              <input value={h.inicio} onChange={e => atualizarHorario(idx, 'inicio', e.target.value)} placeholder="07:25" inputMode="numeric" style={{ ...iStyle, height: 42, textAlign: 'center' }} />
            </div>
            <div style={{ paddingBottom: 11, color: muted, fontWeight: 700, fontSize: 16 }}>→</div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: muted, margin: '0 0 4px 2px' }}>Final</label>
              <input value={h.final} onChange={e => atualizarHorario(idx, 'final', e.target.value)} placeholder="11:40" inputMode="numeric" style={{ ...iStyle, height: 42, textAlign: 'center' }} />
            </div>
            <button onClick={() => removerHorario(idx)} style={{ width: 42, height: 42, flexShrink: 0, border: `1px solid ${border}`, borderRadius: 9, background: dark ? '#16252F' : '#F4F7FB', color: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 13h8l1-13"/></svg>
            </button>
          </div>
        ))}
      </div>

      {/* OBSERVAÇÕES */}
      <Sec titulo="Observações" />
      <textarea ref={rObs} value={form.obs} onChange={e => setField('obs', e.target.value)} placeholder="Anotações da aplicação..." style={{ width: '100%', boxSizing: 'border-box', minHeight: 96, padding: 13, borderRadius: 14, border: `1px solid ${border}`, background: surface, color: text, fontSize: 15, outline: 'none', resize: 'none', lineHeight: 1.5, boxShadow: shadow, fontFamily: 'inherit' }} />

      {/* BOTÃO SALVAR */}
      <button onClick={salvar} disabled={salvando} style={{ width: '100%', height: 52, marginTop: 18, border: 'none', borderRadius: 14, background: '#3E9E4E', color: '#fff', fontSize: 16, fontWeight: 800, cursor: salvando ? 'not-allowed' : 'pointer', opacity: salvando ? 0.7 : 1, boxShadow: '0 10px 24px rgba(62,158,78,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, fontFamily: 'inherit' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        {salvando ? 'Salvando...' : 'Salvar e enviar'}
      </button>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: 96, transform: 'translateX(-50%)', background: dark ? '#1B2233' : '#283E55', color: '#fff', padding: '12px 18px', borderRadius: 13, fontSize: 13.5, fontWeight: 700, boxShadow: '0 12px 30px rgba(0,0,0,.32)', display: 'flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap', zIndex: 50 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3E9E4E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
        </div>
      )}
    </div>
  )
}