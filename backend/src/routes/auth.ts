import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { db } from '../database'
import { JwtPayload } from '../types'
import crypto from 'crypto'

// ── Funções de senha ──────────────────────────────────────────────

function gerarHash(senha: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(senha, salt, 100000, 64, 'sha256').toString('hex')
  return `${salt}:${hash}`
}

function verificarSenha(senha: string, senhaHash: string): boolean {
  const [salt, hash] = senhaHash.split(':')
  if (!salt || !hash) return false
  const hashTentativa = crypto.pbkdf2Sync(senha, salt, 100000, 64, 'sha256').toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hashTentativa))
}

// ── Verifica se quem está chamando a rota é um admin autenticado ──
// Usa o token JWT que o app já envia automaticamente em toda chamada,
// em vez de pedir a senha de novo (que o app nunca guarda, por segurança).
// Se não for admin válido, já manda a resposta de erro e retorna null.
async function exigirAdmin(request: FastifyRequest, reply: FastifyReply): Promise<JwtPayload | null> {
  try {
    await request.jwtVerify()
  } catch {
    reply.status(401).send({ erro: 'Não autenticado. Faça login novamente.' })
    return null
  }

  const usuario = request.user as JwtPayload
  if (usuario.perfil !== 'admin') {
    reply.status(403).send({ erro: 'Apenas administradores podem fazer isso' })
    return null
  }

  return usuario
}

// ── Rotas ─────────────────────────────────────────────────────────

export async function authRoutes(app: FastifyInstance) {

  // POST /auth/login
  app.post('/auth/login', async (request, reply) => {
    const schema = z.object({
      email: z.string().min(1, { message: 'Usuário obrigatório' }),
      senha: z.string().min(1, { message: 'Senha obrigatória' })
    })

    const resultado = schema.safeParse(request.body)

    if (!resultado.success) {
      return reply.status(400).send({
        erro: 'Dados inválidos',
        detalhes: resultado.error.flatten().fieldErrors
      })
    }

    const { email, senha } = resultado.data

    // Busca por email OU por nome (usuário simples)
    const { data: usuario, error } = await db
      .from('usuarios')
      .select('*')
      .or(`email.eq.${email},nome.ilike.${email}`)
      .eq('ativo', true)
      .single()

    if (error || !usuario) {
      return reply.status(401).send({ erro: 'Usuário ou senha incorretos' })
    }

    if (usuario.senha_hash === 'SENHA_PROVISORIA_TROCAR') {
      return reply.status(401).send({ erro: 'Conta não configurada. Contate o administrador.' })
    }

    const senhaCorreta = verificarSenha(senha, usuario.senha_hash)

    if (!senhaCorreta) {
      return reply.status(401).send({ erro: 'Usuário ou senha incorretos' })
    }

    const payload: JwtPayload = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      senha_temporaria: usuario.senha_temporaria ?? false
    }

    const token = app.jwt.sign(payload, { expiresIn: '8h' })

    return reply.send({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        senha_temporaria: usuario.senha_temporaria ?? false
      }
    })
  })

  // POST /auth/criar-admin (só funciona se não existir nenhum admin real)
  app.post('/auth/criar-admin', async (request, reply) => {
    const schema = z.object({
      nome: z.string().min(2),
      email: z.string().email(),
      senha: z.string().min(6)
    })

    const resultado = schema.safeParse(request.body)
    if (!resultado.success) {
      return reply.status(400).send({ erro: 'Dados inválidos' })
    }

    const { data: admins } = await db
      .from('usuarios')
      .select('id')
      .eq('perfil', 'admin')
      .neq('senha_hash', 'SENHA_PROVISORIA_TROCAR')

    if (admins && admins.length > 0) {
      return reply.status(403).send({ erro: 'Já existe um administrador cadastrado' })
    }

    const { nome, email, senha } = resultado.data
    const senhaHash = gerarHash(senha)

    const { data, error } = await db
      .from('usuarios')
      .insert({ nome, email, senha_hash: senhaHash, perfil: 'admin' })
      .select('id, nome, email, perfil')
      .single()

    if (error) {
      return reply.status(500).send({ erro: 'Erro ao criar administrador', detalhe: error.message })
    }

    return reply.status(201).send({
      mensagem: 'Administrador criado com sucesso',
      usuario: data
    })
  })
  // POST /auth/definir-senha (admin define/reseta a senha de um usuário)
  app.post('/auth/definir-senha', async (request, reply) => {
    const admin = await exigirAdmin(request, reply)
    if (!admin) return

    const schema = z.object({
      id: z.string().uuid(),
      senha: z.string().min(6),
      senha_temporaria: z.boolean().optional(),
    })

    const resultado = schema.safeParse(request.body)
    if (!resultado.success) {
      return reply.status(400).send({ erro: 'Dados inválidos', detalhes: resultado.error.flatten().fieldErrors })
    }

    const { id, senha, senha_temporaria } = resultado.data
    const senhaHash = gerarHash(senha)

    // Por padrão, ao resetar a senha o usuário precisa trocá-la no próximo login
    // (a menos que o admin explicitamente marque como senha definitiva)
    const { error } = await db
      .from('usuarios')
      .update({ senha_hash: senhaHash, senha_temporaria: senha_temporaria ?? true })
      .eq('id', id)

    if (error) {
      return reply.status(500).send({ erro: 'Erro ao definir senha', detalhe: error.message })
    }

    return reply.send({ mensagem: 'Senha definida com sucesso' })
  })
  // POST /auth/criar-piloto (admin cria piloto)
  app.post('/auth/criar-piloto', async (request, reply) => {
    const admin = await exigirAdmin(request, reply)
    if (!admin) return // exigirAdmin já mandou a resposta de erro

    const schema = z.object({
      nome: z.string().min(2),
      senha: z.string().min(6),
      email: z.string().email().optional(),
      senha_temporaria: z.boolean().optional(),
    })

    const resultado = schema.safeParse(request.body)
    if (!resultado.success) {
      return reply.status(400).send({ erro: 'Dados inválidos', detalhes: resultado.error.flatten().fieldErrors })
    }

    const { nome, senha, email, senha_temporaria } = resultado.data

    const senhaHash = gerarHash(senha)
    const emailFinal = email || `${nome.toLowerCase().replace(/\s/g, '')}@vgr.com`

    const { data, error } = await db
      .from('usuarios')
      .insert({
        nome: nome.toUpperCase(),
        email: emailFinal,
        senha_hash: senhaHash,
        perfil: 'piloto',
        senha_temporaria: senha_temporaria ?? false,
      })
      .select('id, nome, email, perfil, senha_temporaria')
      .single()

    if (error) return reply.status(500).send({ erro: 'Erro ao criar piloto', detalhe: error.message })

    return reply.status(201).send({ mensagem: 'Piloto criado com sucesso', usuario: data })
  })
  // POST /auth/trocar-senha — piloto troca a própria senha temporária
  app.post('/auth/trocar-senha', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.status(401).send({ erro: 'Não autenticado. Faça login novamente.' })
    }

    const usuario = request.user as JwtPayload

    const schema = z.object({
      senha_nova: z.string().min(6, { message: 'Senha mínimo 6 caracteres' }),
    })

    const resultado = schema.safeParse(request.body)
    if (!resultado.success) {
      return reply.status(400).send({ erro: resultado.error.flatten().fieldErrors.senha_nova?.[0] || 'Dados inválidos' })
    }

    const senhaHash = gerarHash(resultado.data.senha_nova)

    const { error } = await db
      .from('usuarios')
      .update({ senha_hash: senhaHash, senha_temporaria: false })
      .eq('id', usuario.id)

    if (error) return reply.status(500).send({ erro: 'Erro ao trocar senha', detalhe: error.message })

    return reply.send({ mensagem: 'Senha alterada com sucesso' })
  })

  // GET /usuarios — lista todos os usuários
  app.get('/usuarios', async (request, reply) => {
    const { data, error } = await db
      .from('usuarios')
      .select('id, nome, email, perfil, ativo, criado_em, senha_temporaria')
      .order('criado_em', { ascending: false })

    if (error) return reply.status(500).send({ erro: error.message })
    return reply.send({ usuarios: data })
  })

  // PATCH /usuarios/:id/ativo — admin ativa ou desativa um usuário
  app.patch('/usuarios/:id/ativo', async (request, reply) => {
    const admin = await exigirAdmin(request, reply)
    if (!admin) return

    const { id } = request.params as { id: string }

    const schema = z.object({ ativo: z.boolean() })
    const resultado = schema.safeParse(request.body)
    if (!resultado.success) {
      return reply.status(400).send({ erro: 'Dados inválidos' })
    }

    const { data, error } = await db
      .from('usuarios')
      .update({ ativo: resultado.data.ativo })
      .eq('id', id)
      .select('id, nome, ativo')
      .single()

    if (error) return reply.status(500).send({ erro: error.message })
    return reply.send({ mensagem: 'Usuário atualizado', usuario: data })
  })

  // DELETE /usuarios/:id — admin exclui permanentemente um usuário
  app.delete('/usuarios/:id', async (request, reply) => {
    const admin = await exigirAdmin(request, reply)
    if (!admin) return

    const { id } = request.params as { id: string }

    // Protege a conta do próprio admin logado de ser excluída
    if (id === admin.id) {
      return reply.status(403).send({ erro: 'Você não pode excluir sua própria conta' })
    }

    // Protege qualquer outra conta admin de ser excluída
    const { data: alvo } = await db
      .from('usuarios')
      .select('perfil')
      .eq('id', id)
      .single()

    if (alvo?.perfil === 'admin') {
      return reply.status(403).send({ erro: 'Contas de administrador não podem ser excluídas' })
    }

    const { error } = await db
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (error) return reply.status(500).send({ erro: error.message })
    return reply.send({ mensagem: 'Usuário excluído permanentemente' })
  })
}