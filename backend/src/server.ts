import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import dotenv from 'dotenv'
import { authRoutes } from './routes/auth'
import { relatoriosRoutes } from './routes/relatorios'
import { cadastrosRoutes } from './routes/cadastros'

dotenv.config()

const app = Fastify({ logger: true })

// ── Plugins de segurança ──────────────────────────────────────────
app.register(helmet)

app.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
})

app.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'fallback_secret'
})

// ── Rotas ─────────────────────────────────────────────────────────
app.register(authRoutes)
app.register(relatoriosRoutes)
app.register(cadastrosRoutes)

// ── Rota de teste ─────────────────────────────────────────────────
app.get('/health', async () => {
  return {
    status: 'ok',
    app: 'VGR AgroPilot API',
    versao: '1.0.0'
  }
})

// ── Inicializa ────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3333

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`\n🚀 VGR AgroPilot API rodando em http://localhost:${PORT}`)
  console.log(`🔍 Teste: http://localhost:${PORT}/health\n`)
})