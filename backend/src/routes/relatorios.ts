import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../database'

export async function relatoriosRoutes(app: FastifyInstance) {

  // GET /relatorios — lista relatórios ativos (não excluídos)
  app.get('/relatorios', async (request, reply) => {
    const { piloto, fazenda } = request.query as { piloto?: string; fazenda?: string }

    let query = db.from('relatorios').select('*').is('excluido_em', null).order('criado_em', { ascending: false })

    if (piloto) query = query.ilike('piloto', piloto)
    if (fazenda) query = query.ilike('fazenda', fazenda)

    const { data, error } = await query

    if (error) return reply.status(500).send({ erro: error.message })
    return reply.send({ relatorios: data })
  })

  // GET /relatorios/lixeira — lista relatórios excluídos (na lixeira)
  app.get('/relatorios/lixeira', async (request, reply) => {
    const { data, error } = await db
      .from('relatorios')
      .select('*')
      .not('excluido_em', 'is', null)
      .order('excluido_em', { ascending: false })

    if (error) return reply.status(500).send({ erro: error.message })
    return reply.send({ relatorios: data })
  })

  // GET /relatorios/proximo-numero — retorna próximo número disponível (atômico, sem duplicar)
  app.get('/relatorios/proximo-numero', async (request, reply) => {
    const { data, error } = await db.rpc('proximo_numero_relatorio')

    if (error) return reply.status(500).send({ erro: error.message })

    const proximo = String(data).padStart(3, '0')
    return reply.send({ proximo })
  })

  // POST /relatorios — cria novo relatório
  app.post('/relatorios', async (request, reply) => {
    const schema = z.object({
      numero_os: z.string(),
      data_atividade: z.string(),
      proprietario: z.string().optional(),
      municipio: z.string().optional(),
      fazenda: z.string().optional(),
      pista_em_uso: z.string().optional(),
      tipo_servico: z.string().optional(),
      cultura: z.string().optional(),
      altura_voo: z.string().optional(),
      faixa: z.string().optional(),
      piloto: z.string().optional(),
      equipamento: z.string().optional(),
      tecnico_ajudante: z.string().optional(),
      vazao: z.string().optional(),
      aeronave_pr: z.string().optional(),
      modelo: z.string().optional(),
      angulo: z.string().optional(),
      hi_trans: z.string().optional(),
      hi_area: z.string().optional(),
      hf_trans: z.string().optional(),
      hf_area: z.string().optional(),
      area_total: z.number().optional(),
      horarios_por_dia: z.array(z.any()).optional(),
      passadas: z.array(z.any()).optional(),
      observacoes: z.string().optional(),
      usuario_id: z.string().uuid().optional(),
    })

    const resultado = schema.safeParse(request.body)
    if (!resultado.success) {
      return reply.status(400).send({ erro: 'Dados inválidos', detalhes: resultado.error.flatten().fieldErrors })
    }

    const { data, error } = await db
      .from('relatorios')
      .insert({ ...resultado.data, status_sync: 'synced' })
      .select()
      .single()

    if (error) return reply.status(500).send({ erro: error.message })
    return reply.status(201).send({ relatorio: data })
  })

  // PATCH /relatorios/:id/excluir — move para a lixeira (soft delete) e libera o número
  app.patch('/relatorios/:id/excluir', async (request, reply) => {
    const { id } = request.params as { id: string }

    const { data, error } = await db
      .from('relatorios')
      .update({ excluido_em: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return reply.status(500).send({ erro: error.message })

    // Libera o número para reutilização (se for numérico válido)
    const numero = parseInt(data?.numero_os)
    if (!isNaN(numero)) {
      const { error: erroLiberar } = await db.rpc('liberar_numero_relatorio', { num: numero })
      if (erroLiberar) {
        console.error('❌ Erro ao liberar número', numero, ':', erroLiberar)
      } else {
        console.log('✅ Número', numero, 'liberado com sucesso')
      }
    } else {
      console.warn('⚠️ numero_os inválido, não foi possível liberar:', data?.numero_os)
    }

    return reply.send({ mensagem: 'Relatório movido para a lixeira', relatorio: data })
  })

  // PATCH /relatorios/:id/restaurar — tira da lixeira e trava o número de novo
  app.patch('/relatorios/:id/restaurar', async (request, reply) => {
    const { id } = request.params as { id: string }

    const { data, error } = await db
      .from('relatorios')
      .update({ excluido_em: null })
      .eq('id', id)
      .select()
      .single()

    if (error) return reply.status(500).send({ erro: error.message })

    // Trava o número de novo, evitando reuso por outro relatório
    const numero = parseInt(data?.numero_os)
    if (!isNaN(numero)) {
      const { error: erroTravar } = await db.rpc('travar_numero_relatorio', { num: numero })
      if (erroTravar) {
        console.error('❌ Erro ao travar número', numero, ':', erroTravar)
      } else {
        console.log('✅ Número', numero, 'travado com sucesso')
      }
    } else {
      console.warn('⚠️ numero_os inválido, não foi possível travar:', data?.numero_os)
    }

    return reply.send({ mensagem: 'Relatório restaurado', relatorio: data })
  })

  // DELETE /relatorios/:id — exclui permanentemente (usado pela lixeira manual ou pelo job de 30 dias)
  app.delete('/relatorios/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const { error } = await db
      .from('relatorios')
      .delete()
      .eq('id', id)

    if (error) return reply.status(500).send({ erro: error.message })
    return reply.send({ mensagem: 'Relatório excluído permanentemente' })
  })

  // POST /relatorios/limpar-lixeira — exclui permanentemente tudo que está há mais de 30 dias na lixeira
  // (pode ser chamado manualmente pelo admin ou agendado via cron externo)
  app.post('/relatorios/limpar-lixeira', async (request, reply) => {
    const limite = new Date()
    limite.setDate(limite.getDate() - 30)

    const { data, error } = await db
      .from('relatorios')
      .delete()
      .not('excluido_em', 'is', null)
      .lt('excluido_em', limite.toISOString())
      .select()

    if (error) return reply.status(500).send({ erro: error.message })
    return reply.send({ mensagem: `${data?.length || 0} relatório(s) excluído(s) permanentemente`, excluidos: data })
  })
}