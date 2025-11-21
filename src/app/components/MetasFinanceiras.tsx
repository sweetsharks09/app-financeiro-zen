"use client"

import { useState, useEffect } from 'react'
import { ArrowLeft, Target, AlertTriangle, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase, type Meta } from '@/lib/supabase'
import { toast } from 'sonner'

interface Props {
  onVoltar: () => void
  gastosPorCategoria: Record<string, number>
}

const categorias = [
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Contas Fixas',
  'Educação',
  'Outros'
]

export default function MetasFinanceiras({ onVoltar, gastosPorCategoria }: Props) {
  const [metas, setMetas] = useState<Meta[]>([])
  const [novaMeta, setNovaMeta] = useState({ categoria: '', valor_limite: '' })
  const [adicionando, setAdicionando] = useState(false)

  useEffect(() => {
    carregarMetas()
  }, [])

  async function carregarMetas() {
    try {
      const { data, error } = await supabase
        .from('metas')
        .select('*')

      if (error) throw error
      if (data) setMetas(data)
    } catch (error) {
      console.error('Erro ao carregar metas:', error)
    }
  }

  async function adicionarMeta() {
    if (!novaMeta.categoria || !novaMeta.valor_limite) {
      toast.error('Preencha todos os campos')
      return
    }

    setAdicionando(true)
    try {
      const { error } = await supabase
        .from('metas')
        .insert({
          categoria: novaMeta.categoria,
          valor_limite: parseFloat(novaMeta.valor_limite),
          aviso_enviado: false
        })

      if (error) throw error

      toast.success('Meta adicionada com sucesso!')
      setNovaMeta({ categoria: '', valor_limite: '' })
      carregarMetas()
    } catch (error) {
      console.error('Erro ao adicionar meta:', error)
      toast.error('Erro ao adicionar meta')
    } finally {
      setAdicionando(false)
    }
  }

  async function removerMeta(id: string) {
    try {
      const { error } = await supabase
        .from('metas')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Meta removida')
      carregarMetas()
    } catch (error) {
      console.error('Erro ao remover meta:', error)
      toast.error('Erro ao remover meta')
    }
  }

  function verificarMeta(categoria: string, limite: number) {
    const gastoAtual = gastosPorCategoria[categoria] || 0
    const porcentagem = (gastoAtual / limite) * 100
    const ultrapassou = gastoAtual > limite

    return { gastoAtual, porcentagem, ultrapassou }
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

        <h1 className="text-3xl font-bold text-black mb-6">Metas Financeiras</h1>

        {/* Adicionar Nova Meta */}
        <Card className="p-6 mb-6 border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-black">Adicionar Nova Meta</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Categoria</Label>
              <Select
                value={novaMeta.categoria}
                onValueChange={(value) => setNovaMeta({ ...novaMeta, categoria: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valor Limite (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={novaMeta.valor_limite}
                onChange={(e) => setNovaMeta({ ...novaMeta, valor_limite: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            onClick={adicionarMeta}
            disabled={adicionando}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {adicionando ? 'Adicionando...' : 'Adicionar Meta'}
          </Button>
        </Card>

        {/* Lista de Metas */}
        <div className="space-y-4">
          {metas.length === 0 ? (
            <Card className="p-8 text-center border-2 border-gray-200">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">Nenhuma meta definida ainda</p>
            </Card>
          ) : (
            metas.map(meta => {
              const { gastoAtual, porcentagem, ultrapassou } = verificarMeta(meta.categoria, Number(meta.valor_limite))

              return (
                <Card
                  key={meta.id}
                  className={`p-6 border-2 ${ultrapassou ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className={`w-5 h-5 ${ultrapassou ? 'text-red-600' : 'text-black'}`} />
                        <h3 className="text-lg font-bold text-black">{meta.categoria}</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Limite: R$ {Number(meta.valor_limite).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      onClick={() => removerMeta(meta.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {ultrapassou && (
                    <div className="flex items-center gap-2 mb-3 p-3 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <p className="text-sm font-semibold text-red-700">
                        Atenção! Você ultrapassou a meta da categoria {meta.categoria}.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gasto atual</span>
                      <span className={`font-bold ${ultrapassou ? 'text-red-600' : 'text-black'}`}>
                        R$ {gastoAtual.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          ultrapassou ? 'bg-red-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(porcentagem, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 text-right">
                      {porcentagem.toFixed(1)}% da meta
                    </p>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
