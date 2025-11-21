"use client"

import { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Props {
  onVoltar: () => void
  onSalvar: () => void
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

export default function AdicionarGasto({ onVoltar, onSalvar }: Props) {
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSalvar() {
    if (!valor || !descricao || !categoria) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setSalvando(true)
    try {
      const { error } = await supabase
        .from('gastos')
        .insert({
          data,
          valor: parseFloat(valor),
          descricao,
          categoria
        })

      if (error) throw error

      toast.success('Gasto registrado com sucesso! Já atualizei seu painel financeiro.')
      onSalvar()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar gasto')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          onClick={onVoltar}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-3xl font-bold text-black mb-6">Adicionar Gasto</h1>

        <Card className="p-6 border-2 border-gray-200">
          <div className="space-y-4">
            <div>
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                type="text"
                placeholder="Ex: Compras no supermercado"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSalvar}
              disabled={salvando}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              <Save className="w-5 h-5 mr-2" />
              {salvando ? 'Salvando...' : 'Salvar Gasto'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
