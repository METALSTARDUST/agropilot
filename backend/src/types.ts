// ── Perfis de usuário ─────────────────────────────────────────────
export type Perfil = 'piloto' | 'admin'

// ── Usuário ───────────────────────────────────────────────────────
export interface Usuario {
  id: string
  nome: string
  email: string
  senha_hash: string
  perfil: Perfil
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

// ── Payload do JWT (o que fica gravado no token) ──────────────────
export interface JwtPayload {
  id: string
  nome: string
  email: string
  perfil: Perfil
  senha_temporaria: boolean
}

// ── Relatório ─────────────────────────────────────────────────────
export interface Relatorio {
  id: string
  numero_os?: string
  data_atividade: string
  proprietario?: string
  municipio?: string
  fazenda?: string
  pista_em_uso?: string
  tipo_servico?: string
  cultura?: string
  altura_voo?: string
  faixa?: string
  piloto?: string
  equipamento?: string
  tecnico_ajudante?: string
  aeronave_pr?: string
  modelo?: string
  angulo?: string
  vazao?: string
  hi_trans?: string
  hi_area?: string
  hf_trans?: string
  hf_area?: string
  area_total?: number
  horarios_por_dia?: object[]
  observacoes?: string
  usuario_id?: string
  status_sync: 'pending' | 'synced' | 'conflict'
  criado_em: string
  atualizado_em: string
}

// ── Cadastro ──────────────────────────────────────────────────────
export type TipoCadastro = 'fazenda' | 'municipio' | 'piloto' | 'equipamento' | 'aeronave' | 'cultura'

export interface Cadastro {
  id: string
  tipo: TipoCadastro
  codigo: number
  valor: string
  ativo: boolean
  criado_em: string
}