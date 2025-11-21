import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types para o banco de dados
export interface Gasto {
  id: string
  data: string
  valor: number
  descricao: string
  categoria: string
  foto?: string
  criado_em: string
}

export interface Categoria {
  id: string
  nome: string
  tipo: 'fixa' | 'variavel'
}

export interface Meta {
  id: string
  categoria: string
  valor_limite: number
  aviso_enviado: boolean
}
