import axios from 'axios'
import { localDB } from '../db/database'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3333'

// ── Login ─────────────────────────────────────────────────────────
export async function login(usuario: string, senha: string) {
  const { data } = await axios.post(`${API}/auth/login`, { email: usuario, senha })

  // Calcula quando o token expira (8h)
  const expira = new Date()
  expira.setHours(expira.getHours() + 8)

  // Salva sessão no banco local
  await localDB.sessao.clear()
  await localDB.sessao.add({
    token: data.token,
    usuario: data.usuario,
    expira_em: expira.toISOString()
  })

  return data
}

// ── Logout ────────────────────────────────────────────────────────
export async function logout() {
  await localDB.sessao.clear()
}

// ── Recupera sessão salva ─────────────────────────────────────────
export async function getSessao() {
  const sessao = await localDB.sessao.toArray()
  if (!sessao.length) return null

  const s = sessao[0]
  const agora = new Date()
  const expira = new Date(s.expira_em)

  // Token expirado
  if (agora > expira) {
    await localDB.sessao.clear()
    return null
  }

  return s

  
}