import * as XLSX from 'xlsx'

interface Horario {
  dia: string
  inicio: string
  final: string
}

interface Passada {
  passada: number
  horimetro: string
}

interface Relatorio {
  numero: string
  os?: string
  data: string
  proprietario?: string
  municipio?: string
  fazenda?: string
  pista?: string
  tipoServico?: string
  cultura?: string
  altura?: string
  faixa?: string
  piloto?: string
  equipamento?: string
  tecnico?: string
  vazao?: string
  aeronave?: string
  modelo?: string
  angulo?: string
  hiTrans?: string
  hiArea?: string
  hfTrans?: string
  hfArea?: string
  areaTotal?: string
  obs?: string
  horarios?: Horario[]
  passadas?: Passada[]
}

export function exportarRelatorioXLSX(relatorio: Relatorio) {
  const dados = [
    ['RELATÓRIO DE ATIVIDADE AEROAGRÍCOLA'],
    ['VGR Gestão Contábil — AgroPilot'],
    [],
    [
      'Nº Relatório', 'O.S.', 'Data',
      'Proprietário', 'Município', 'Fazenda', 'Pista em uso',
      'Tipo de serviço', 'Cultura', 'Altura voo', 'Faixa',
      'Piloto', 'Equipamento', 'Téc./Ajudante', 'Vazão',
      'Aeronave PR-', 'Modelo', 'Ângulo',
      'HI Trans', 'HI Área', 'HF Trans', 'HF Área',
      'Área Total (ha)', 'Observações'
    ],
    [
      relatorio.numero || '',
      relatorio.os || '',
      relatorio.data || '',
      relatorio.proprietario || '',
      relatorio.municipio || '',
      relatorio.fazenda || '',
      relatorio.pista || '',
      relatorio.tipoServico || '',
      relatorio.cultura || '',
      relatorio.altura || '',
      relatorio.faixa || '',
      relatorio.piloto || '',
      relatorio.equipamento || '',
      relatorio.tecnico || '',
      relatorio.vazao || '',
      relatorio.aeronave || '',
      relatorio.modelo || '',
      relatorio.angulo || '',
      relatorio.hiTrans || '',
      relatorio.hiArea || '',
      relatorio.hfTrans || '',
      relatorio.hfArea || '',
      relatorio.areaTotal || '',
      relatorio.obs || '',
    ]
  ]

  if (relatorio.horarios && relatorio.horarios.length > 0) {
    dados.push([])
    dados.push(['HORÁRIOS POR DIA'])
    dados.push(['Dia', 'Início', 'Final'])
    relatorio.horarios.forEach(h => {
      dados.push([h.dia, h.inicio, h.final])
    })
  }

  if (relatorio.passadas && relatorio.passadas.length > 0) {
    dados.push([])
    dados.push(['CONTROLE POR PASSADA'])
    dados.push(['Passada', 'Horímetro'])
    relatorio.passadas.forEach(p => {
      dados.push([String(p.passada), p.horimetro])
    })
  }

  const ws = XLSX.utils.aoa_to_sheet(dados)

  ws['!cols'] = [
    { wch: 14 }, { wch: 10 }, { wch: 12 },
    { wch: 20 }, { wch: 14 }, { wch: 22 }, { wch: 14 },
    { wch: 28 }, { wch: 10 }, { wch: 10 }, { wch: 8 },
    { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 8 },
    { wch: 12 }, { wch: 12 }, { wch: 8 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 14 }, { wch: 30 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório')

  const nomeArquivo = `VGR_Relatorio_${relatorio.numero}_${relatorio.data.replace(/\//g, '-')}.xlsx`
  XLSX.writeFile(wb, nomeArquivo)
}

export function exportarVariosRelatoriosXLSX(relatorios: any[], nomeGrupo: string = 'Todos') {
  const cabecalho = [
    'Nº', 'O.S.', 'Data', 'Proprietário', 'Município', 'Fazenda',
    'Tipo de serviço', 'Cultura', 'Piloto', 'Equipamento',
    'Aeronave', 'HI Trans', 'HI Área', 'HF Trans', 'HF Área',
    'Área Total (ha)', 'Qtd Passadas', 'Observações'
  ]

  const linhas = relatorios.map(r => [
    r.numero || '', r.os || '', r.data || '',
    r.proprietario || '', r.municipio || '', r.fazenda || '',
    r.tipoServico || '', r.cultura || '', r.piloto || '',
    r.equipamento || '', r.aeronave || '',
    r.hiTrans || '', r.hiArea || '', r.hfTrans || '', r.hfArea || '',
    r.areaTotal || '', (r.passadas || []).length, r.obs || ''
  ])

  const dados = [
    ['RELATÓRIOS AEROAGRÍCOLAS — VGR AgroPilot'],
    [`Grupo: ${nomeGrupo} · Total: ${relatorios.length} relatório(s)`],
    [],
    cabecalho,
    ...linhas
  ]

  const ws = XLSX.utils.aoa_to_sheet(dados)
  ws['!cols'] = Array(18).fill({ wch: 16 })
  ws['!cols'][3] = { wch: 22 }
  ws['!cols'][5] = { wch: 24 }
  ws['!cols'][6] = { wch: 28 }
  ws['!cols'][17] = { wch: 32 }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Relatórios')

  const data = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
  XLSX.writeFile(wb, `VGR_Relatorios_${nomeGrupo.replace(/\s/g, '_')}_${data}.xlsx`)
}

export function exportarRelatorioPDF(relatorio: Relatorio) {
  const conteudo = `
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #1B2233; }
        h1 { color: #283E55; font-size: 18px; margin-bottom: 4px; }
        h2 { color: #3E9E4E; font-size: 14px; margin-bottom: 20px; font-weight: normal; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
        .campo { border-bottom: 1px solid #DCE3EE; padding-bottom: 6px; }
        .label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #94AABF; letter-spacing: .05em; }
        .valor { font-size: 13px; font-weight: bold; margin-top: 2px; }
        .full { grid-column: 1 / -1; }
        .secao { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: #283E55; border-left: 4px solid #3E9E4E; padding-left: 8px; margin: 20px 0 12px; }
        .area-total { background: #E8F4EA; border: 1px solid #3E9E4E; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
        .area-total .label { color: #3E9E4E; }
        .area-total .valor { color: #3E9E4E; font-size: 22px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #283E55; color: #fff; padding: 6px 10px; text-align: left; }
        td { padding: 6px 10px; border-bottom: 1px solid #DCE3EE; }
        .rodape { margin-top: 30px; font-size: 10px; color: #94AABF; text-align: center; }
      </style>
    </head>
    <body>
      <h1>VGR AgroPilot — Relatório de Atividade Aeroagrícola</h1>
      <h2>Nº ${relatorio.numero} · ${relatorio.data}</h2>

      <div class="secao">Identificação</div>
      <div class="grid">
        <div class="campo"><div class="label">Proprietário</div><div class="valor">${relatorio.proprietario || '—'}</div></div>
        <div class="campo"><div class="label">Data</div><div class="valor">${relatorio.data || '—'}</div></div>
        <div class="campo"><div class="label">Município</div><div class="valor">${relatorio.municipio || '—'}</div></div>
        <div class="campo"><div class="label">Fazenda</div><div class="valor">${relatorio.fazenda || '—'}</div></div>
        <div class="campo full"><div class="label">Tipo de serviço</div><div class="valor">${relatorio.tipoServico || '—'}</div></div>
      </div>

      <div class="secao">Operação</div>
      <div class="grid">
        <div class="campo"><div class="label">Cultura</div><div class="valor">${relatorio.cultura || '—'}</div></div>
        <div class="campo"><div class="label">Altura / Faixa</div><div class="valor">${relatorio.altura || '—'} m / ${relatorio.faixa || '—'} m</div></div>
        <div class="campo"><div class="label">Piloto</div><div class="valor">${relatorio.piloto || '—'}</div></div>
        <div class="campo"><div class="label">Equipamento</div><div class="valor">${relatorio.equipamento || '—'}</div></div>
        <div class="campo"><div class="label">Téc./Ajudante</div><div class="valor">${relatorio.tecnico || '—'}</div></div>
        <div class="campo"><div class="label">Vazão</div><div class="valor">${relatorio.vazao || '—'}</div></div>
      </div>

      <div class="secao">Aeronave</div>
      <div class="grid">
        <div class="campo"><div class="label">Aeronave PR-</div><div class="valor">${relatorio.aeronave || '—'}</div></div>
        <div class="campo"><div class="label">Modelo</div><div class="valor">${relatorio.modelo || '—'}</div></div>
        <div class="campo"><div class="label">Ângulo</div><div class="valor">${relatorio.angulo || '—'}</div></div>
      </div>

      <div class="secao">Horímetro</div>
      <div class="grid">
        <div class="campo"><div class="label">HI Trans</div><div class="valor">${relatorio.hiTrans || '—'}</div></div>
        <div class="campo"><div class="label">HI Área</div><div class="valor">${relatorio.hiArea || '—'}</div></div>
        <div class="campo"><div class="label">HF Trans</div><div class="valor">${relatorio.hfTrans || '—'}</div></div>
        <div class="campo"><div class="label">HF Área</div><div class="valor">${relatorio.hfArea || '—'}</div></div>
      </div>

      ${relatorio.passadas && relatorio.passadas.length > 0 ? `
      <div class="secao">Controle por Passada</div>
      <table>
        <tr><th>Passada</th><th>Horímetro</th></tr>
        ${relatorio.passadas.map(p => `<tr><td>${p.passada}</td><td>${p.horimetro}</td></tr>`).join('')}
      </table>
      ` : ''}

      ${relatorio.horarios && relatorio.horarios.length > 0 ? `
      <div class="secao">Horários por dia</div>
      <table>
        <tr><th>Dia</th><th>Início</th><th>Final</th></tr>
        ${relatorio.horarios.map(h => `<tr><td>${h.dia}</td><td>${h.inicio}</td><td>${h.final}</td></tr>`).join('')}
      </table>
      ` : ''}

      ${relatorio.obs ? `
      <div class="secao">Observações</div>
      <p style="font-size:13px">${relatorio.obs}</p>
      ` : ''}

      <div class="area-total">
        <div><div class="label">Área total</div></div>
        <div class="valor">${relatorio.areaTotal || '0,00'} ha</div>
      </div>

      <div class="rodape">VGR Gestão Contábil • AgroPilot v1.0 • Gerado em ${new Date().toLocaleString('pt-BR')}</div>
    </body>
    </html>
  `

  const janela = window.open('', '_blank')
  if (!janela) return
  janela.document.write(conteudo)
  janela.document.close()
  janela.focus()
  setTimeout(() => {
    janela.print()
    janela.close()
  }, 500)
}