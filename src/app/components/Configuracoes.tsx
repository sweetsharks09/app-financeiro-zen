"use client"

import { useState, useEffect } from 'react'
import { ArrowLeft, Tag, Plus, Trash2, Edit2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase, type Categoria } from '@/lib/supabase'
import { toast } from 'sonner'

interface Props {
  onVoltar: () => void
}

export default function Configuracoes({ onVoltar }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [novaCategoria, setNovaCategoria] = useState({ nome: '', tipo: 'variavel' as 'fixa' | 'variavel' })
  const [editando, setEditando] = useState<string | null>(null)
  const [adicionando, setAdicionando] = useState(false)

  useEffect(() => {
    carregarCategorias()
  }, [])

  async function carregarCategorias() {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nome')

      if (error) throw error
      if (data) setCategorias(data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  async function adicionarCategoria() {
    if (!novaCategoria.nome) {
      toast.error('Digite o nome da categoria')
      return
    }

    setAdicionando(true)
    try {
      const { error } = await supabase
        .from('categorias')
        .insert({
          nome: novaCategoria.nome,
          tipo: novaCategoria.tipo
        })

      if (error) throw error

      toast.success('Categoria adicionada!')
      setNovaCategoria({ nome: '', tipo: 'variavel' })
      carregarCategorias()
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error)
      toast.error('Erro ao adicionar categoria')
    } finally {
      setAdicionando(false)
    }
  }

  async function removerCategoria(id: string) {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Categoria removida')
      carregarCategorias()
    } catch (error) {
      console.error('Erro ao remover categoria:', error)
      toast.error('Erro ao remover categoria')
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={onVoltar}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-3xl font-bold text-black mb-6">Configurações</h1>

        {/* Gerenciar Categorias */}
        <Card className="p-6 mb-6 border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-black" />
            <h2 className="text-lg font-semibold text-black">Gerenciar Categorias</h2>
          </div>

          {/* Adicionar Nova Categoria */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold text-black">Adicionar Nova Categoria</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div>
                <Label>Nome</Label>
                <Input
                  placeholder="Ex: Investimentos"
                  value={novaCategoria.nome}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Tipo</Label>
                <Select
                  value={novaCategoria.tipo}
                  onValueChange={(value: 'fixa' | 'variavel') => setNovaCategoria({ ...novaCategoria, tipo: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="variavel">Variável</SelectItem>
                    <SelectItem value="fixa">Fixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={adicionarCategoria}
              disabled={adicionando}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {adicionando ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>

          {/* Lista de Categorias */}
          <div className="space-y-2">
            {categorias.map(categoria => (
              <div
                key={categoria.id}
                className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-black transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="font-semibold text-black">{categoria.nome}</p>
                    <p className="text-xs text-gray-600">
                      {categoria.tipo === 'fixa' ? 'Fixa' : 'Variável'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => removerCategoria(categoria.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Informações do App */}
        <Card className="p-6 border-2 border-gray-200">
          <h2 className="text-lg font-semibold text-black mb-4">Sobre o FinanceZen</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <strong className="text-black">Versão:</strong> 1.0.0
            </p>
            <p>
              <strong className="text-black">Assistente:</strong> ZenBot
            </p>
            <p className="mt-4">
              O FinanceZen é seu assistente financeiro inteligente. Use a câmera para registrar
              gastos automaticamente e mantenha suas finanças organizadas de forma simples.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
