"use client"

import { useState, useRef } from 'react'
import { ArrowLeft, Camera, Upload, Check, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { processarRecibo } from '@/lib/zenbot'
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

export default function RegistrarRecibo({ onVoltar, onSalvar }: Props) {
  const [etapa, setEtapa] = useState<'upload' | 'processando' | 'confirmacao'>('upload')
  const [imagemPreview, setImagemPreview] = useState<string>('')
  const [imagemBase64, setImagemBase64] = useState<string>('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [salvando, setSalvando] = useState(false)
  const inputFileRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview da imagem
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setImagemPreview(result)
      setImagemBase64(result)
      processarImagem(result)
    }
    reader.readAsDataURL(file)
  }

  async function processarImagem(base64: string) {
    setEtapa('processando')
    toast.info('ZenBot está analisando sua foto...')

    try {
      const resultado = await processarRecibo(base64)

      if (resultado.valor) setValor(resultado.valor.toString())
      if (resultado.data) setData(resultado.data)
      if (resultado.descricao) setDescricao(resultado.descricao)
      if (resultado.categoria) setCategoria(resultado.categoria)

      setEtapa('confirmacao')
      toast.success('Analisei sua foto! Aqui está o que encontrei. Confirme ou edite antes de salvar.')
    } catch (error) {
      console.error('Erro ao processar:', error)
      toast.error('Não consegui processar a imagem. Preencha manualmente.')
      setEtapa('confirmacao')
    }
  }

  async function handleConfirmar() {
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
          categoria,
          foto: imagemBase64
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

        <h1 className="text-3xl font-bold text-black mb-6">Registrar Recibo</h1>

        {etapa === 'upload' && (
          <Card className="p-8 border-2 border-dashed border-gray-300 text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-black mb-2">
              Tire uma foto ou envie o recibo
            </h2>
            <p className="text-gray-600 mb-6">
              O ZenBot vai ler automaticamente as informações
            </p>
            <input
              ref={inputFileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => inputFileRef.current?.click()}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Upload className="w-5 h-5 mr-2" />
              Selecionar Foto
            </Button>
          </Card>
        )}

        {etapa === 'processando' && (
          <Card className="p-8 border-2 border-gray-200 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-black mb-2">
              Processando recibo...
            </h2>
            <p className="text-gray-600">
              O ZenBot está extraindo as informações
            </p>
          </Card>
        )}

        {etapa === 'confirmacao' && (
          <div className="space-y-6">
            {imagemPreview && (
              <Card className="p-4 border-2 border-gray-200">
                <img
                  src={imagemPreview}
                  alt="Recibo"
                  className="w-full h-auto rounded-lg"
                />
              </Card>
            )}

            <Card className="p-6 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Edit2 className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-black">
                  Confirme ou edite as informações
                </h2>
              </div>

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
                  onClick={handleConfirmar}
                  disabled={salvando}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  <Check className="w-5 h-5 mr-2" />
                  {salvando ? 'Salvando...' : 'Confirmar Gasto'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
