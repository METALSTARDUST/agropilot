import axios from 'axios'
import { localDB } from '../db/database'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3333'

// ── Pega o token salvo ────────────────────────────────────────────
async function getToken(): Promise<string | null> {
  const sessao = await localDB.sessao.toArray()
  return sessao[0]?.token || null
}

// ── Instância com token automático ────────────────────────────────
const api = axios.create({ baseURL: API })

api.interceptors.request.use(async (config) => {
  const token = await getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Relatórios ────────────────────────────────────────────────────
export async function buscarRelatorios(filtros?: { piloto?: string; fazenda?: string }) {
  const { data } = await api.get('/relatorios', { params: filtros })
  return data.relatorios
}

export async function salvarRelatorio(relatorio: any) {
  const { data } = await api.post('/relatorios', relatorio)
  return data.relatorio
}

export async function buscarProximoNumero(): Promise<string> {
  try {
    const { data } = await api.get('/relatorios/proximo-numero')
    return data.proximo
  } catch {
    return '001'
  }
}

// ── Usuários ──────────────────────────────────────────────────────
export async function criarPiloto(dados: { nome: string; senha: string; email?: string; senha_temporaria?: boolean }) {
  const { data } = await api.post('/auth/criar-piloto', dados)
  return data
}

export async function buscarUsuarios() {
  const { data } = await api.get('/usuarios')
  return data.usuarios
}

export async function toggleAtivoUsuario(id: string, ativo: boolean) {
  const { data } = await api.patch(`/usuarios/${id}/ativo`, { ativo })
  return data
}

export async function excluirUsuario(id: string) {
  const { data } = await api.delete(`/usuarios/${id}`)
  return data
}

export async function definirSenhaUsuario(id: string, senha: string, senha_temporaria: boolean) {
  const { data } = await api.post('/auth/definir-senha', { id, senha, senha_temporaria })
  return data
}

export async function resetarSenhaUsuario(id: string, senha: string, temporaria: boolean) {
  const { data } = await api.post('/auth/definir-senha', { id, senha, senha_temporaria: temporaria })
  return data
}

export async function trocarPropriaSenha(senhaNova: string) {
  const { data } = await api.post('/auth/trocar-senha', { senha_nova: senhaNova })
  return data
}

// ── Cadastros ─────────────────────────────────────────────────────
export async function buscarCadastros(tipo?: string) {
  const { data } = await api.get('/cadastros', { params: { tipo } })
  return data.cadastros
}

export async function criarCadastro(dados: { tipo: string; codigo: number; valor: string }) {
  const { data } = await api.post('/cadastros', dados)
  return data.cadastro
}

export async function atualizarCadastro(id: string, dados: { valor?: string; ativo?: boolean }) {
  const { data } = await api.patch(`/cadastros/${id}`, dados)
  return data.cadastro
}

// ── Lixeira de relatórios ───────────────────────────────────────────
export async function buscarLixeira() {
  const { data } = await api.get('/relatorios/lixeira')
  return data.relatorios
}

export async function excluirRelatorio(id: string) {
  const { data } = await api.patch(`/relatorios/${id}/excluir`, {})
  return data.relatorio
}

export async function restaurarRelatorio(id: string) {
  const { data } = await api.patch(`/relatorios/${id}/restaurar`, {})
  return data.relatorio
}

export async function excluirRelatorioPermanente(id: string) {
  const { data } = await api.delete(`/relatorios/${id}`)
  return data
}