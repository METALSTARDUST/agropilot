import { localDB } from '../db/database'
import { buscarCadastros as buscarCadastrosAPI, salvarRelatorio as salvarRelatorioAPI } from './api'

// ── Verifica se está online ────────────────────────────────────────
export function estaOnline(): boolean {
  return navigator.onLine
}

// ── CADASTROS ───────────────────────────────────────────────────────

// Baixa todos os cadastros do servidor e salva localmente (chamar ao logar / abrir app)
export async function baixarCadastrosParaOffline(): Promise<void> {
  if (!estaOnline()) return

  try {
    const tipos = ['proprietario', 'fazenda', 'municipio', 'piloto', 'aeronave', 'cultura', 'equipamento']
    const todos: any[] = []

    for (const tipo of tipos) {
      const dados = await buscarCadastrosAPI(tipo)
      if (dados) todos.push(...dados.map((d: any) => ({ ...d, tipo })))
    }

    // Limpa e regrava local
    await localDB.cadastros.clear()
    await localDB.cadastros.bulkAdd(
      todos.map(d => ({ tipo: d.tipo, codigo: d.codigo, valor: d.valor }))
    )
  } catch (e) {
    console.warn('Falha ao baixar cadastros para offline', e)
  }
}

// Busca cadastros — tenta online primeiro, cai para o local se offline ou der erro
export async function buscarCadastrosOffline(tipo?: string): Promise<any[]> {
  if (estaOnline()) {
    try {
      const dados = await buscarCadastrosAPI(tipo)
      if (dados) {
        // Atualiza cache local em background
        if (tipo) {
          const existentes = await localDB.cadastros.where('tipo').equals(tipo).toArray()
          const idsExistentes = new Set(existentes.map(e => e.codigo))
          const novos = dados.filter((d: any) => !idsExistentes.has(d.codigo))
          if (novos.length > 0) {
            await localDB.cadastros.bulkAdd(novos.map((d: any) => ({ tipo, codigo: d.codigo, valor: d.valor })))
          }
        }
        return dados
      }
    } catch {
      // cai para local abaixo
    }
  }

  // Busca local
  if (tipo) {
    return localDB.cadastros.where('tipo').equals(tipo).toArray()
  }
  return localDB.cadastros.toArray()
}

// ── RELATÓRIOS ────────────────────────────────────────────────────

interface NovoRelatorioPayload {
  [key: string]: any
}

// Salva relatório: online vai direto pro Supabase, offline guarda local como pendente
export async function salvarRelatorioComOffline(payload: NovoRelatorioPayload): Promise<{ sincronizado: boolean }> {
  if (estaOnline()) {
    try {
      await salvarRelatorioAPI(payload)
      return { sincronizado: true }
    } catch (e) {
      // Se falhar mesmo online (ex: servidor fora), cai pro modo offline
      await salvarRelatorioLocal(payload)
      return { sincronizado: false }
    }
  } else {
    await salvarRelatorioLocal(payload)
    return { sincronizado: false }
  }
}

async function salvarRelatorioLocal(payload: NovoRelatorioPayload) {
  const agora = new Date().toISOString()
  await localDB.relatorios.add({
    uuid: crypto.randomUUID(),
    dados: payload,
    status: 'pending',
    criado_em: agora,
    atualizado_em: agora,
  })
}

// Busca relatórios pendentes de sincronização salvos localmente
export async function buscarRelatoriosPendentes() {
  return localDB.relatorios.where('status').equals('pending').toArray()
}

// Tenta sincronizar todos os relatórios pendentes — chamar quando volta a conexão
export async function sincronizarRelatoriosPendentes(): Promise<number> {
  if (!estaOnline()) return 0

  const pendentes = await buscarRelatoriosPendentes()
  let sincronizados = 0

  for (const p of pendentes) {
    try {
      await salvarRelatorioAPI(p.dados)
      await localDB.relatorios.update(p.id!, { status: 'synced', atualizado_em: new Date().toISOString() })
      sincronizados++
    } catch (e) {
      console.warn('Falha ao sincronizar relatório', p.uuid, e)
      // mantém como pending, tenta de novo na próxima
    }
  }

  return sincronizados
}

// Registra listener para sincronizar automaticamente quando a conexão voltar
export function ativarSincronizacaoAutomatica(onSincronizado?: (qtd: number) => void) {
  window.addEventListener('online', async () => {
    const qtd = await sincronizarRelatoriosPendentes()
    if (qtd > 0 && onSincronizado) onSincronizado(qtd)
  })
}