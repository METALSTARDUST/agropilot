import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../database'

export async function cadastrosRoutes(app: FastifyInstance) {

  // GET /cadastros — lista todos ativos
  app.get('/cadastros', async (request, reply) => {
    const { tipo } = request.query as { tipo?: string }

    let query = db
      .from('cadastros')
      .select('*')
      .eq('ativo', true)
      .order('tipo')
      .order('codigo')

    if (tipo) query = query.eq('tipo', tipo)

    const { data, error } = await query

    if (error) return reply.status(500).send({ erro: error.message })
    return reply.send({ cadastros: data })
  })

  // POST /cadastros — cria novo
  app.post('/cadastros', async (request, reply) => {
    const schema = z.object({
      tipo: z.enum(['proprietario', 'fazenda', 'municipio', 'piloto', 'aeronave', 'cultura', 'equipamento']),
      codigo: z.number().int().positive(),
      valor: z.string().min(1)
    })

    const resultado = schema.safeParse(request.body)
    if (!resultado.success) {
      return reply.status(400).send({ erro: 'Dados inválidos', detalhes: resultado.error.flatten().fieldErrors })
    }

    const { tipo, codigo, valor } = resultado.data

    const { data, error } = await db
      .from('cadastros')
      .insert({ tipo, codigo, valor: valor.toUpperCase(), ativo: true })
      .select()
      .single()

    if (error) return reply.status(500).send({ erro: error.message })
    return reply.status(201).send({ cadastro: data })
  })

  // PATCH /cadastros/:id — edita
  app.patch('/cadastros/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const schema = z.object({
      valor: z.string().min(1).optional(),
      ativo: z.boolean().optional()
    })

    const resultado = schema.safeParse(request.body)
    if (!resultado.success) {
      return reply.status(400).send({ erro: 'Dados inválidos' })
    }

    const update: any = {}
    if (resultado.data.valor) update.valor = resultado.data.valor.toUpperCase()
    if (resultado.data.ativo !== undefined) update.ativo = resultado.data.ativo

    const { data, error } = await db
      .from('cadastros')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) return reply.status(500).send({ erro: error.message })
    return reply.send({ cadastro: data })
  })

  // DELETE /cadastros/:id — desativa
  app.delete('/cadastros/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const { error } = await db
      .from('cadastros')
      .update({ ativo: false })
      .eq('id', id)

    if (error) return reply.status(500).send({ erro: error.message })
    return reply.send({ mensagem: 'Cadastro desativado' })
  })
}