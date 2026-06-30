import Dexie, { type Table } from 'dexie'

// ── Tipos do banco local ──────────────────────────────────────────

export interface RelatorioLocal {
  id?: number
  uuid: string
  dados: object
  status: 'pending' | 'synced'
  criado_em: string
  atualizado_em: string
}

export interface CadastroLocal {
  id?: number
  tipo: string
  codigo: number
  valor: string
}

export interface SessaoLocal {
  id?: number
  token: string
  usuario: object
  expira_em: string
}

// ── Definição do banco ────────────────────────────────────────────

class AgropilotDB extends Dexie {
  relatorios!: Table<RelatorioLocal>
  cadastros!: Table<CadastroLocal>
  sessao!: Table<SessaoLocal>

  constructor() {
    super('agropilot')

    this.version(1).stores({
      relatorios: '++id, uuid, status, criado_em',
      cadastros: '++id, tipo, codigo',
      sessao: '++id'
    })
  }
}

export const localDB = new AgropilotDB()