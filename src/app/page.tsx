"use client"

import { useState, useEffect } from 'react'
import { Camera, Plus, List, Settings, TrendingUp, PieChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase, type Gasto } from '@/lib/supabase'
import { toast } from 'sonner'
import AdicionarGasto from './components/AdicionarGasto'
import RegistrarRecibo from './components/RegistrarRecibo'
import ListaGastos from './components/ListaGastos'
import MetasFinanceiras from './components/MetasFinanceiras'
import Configuracoes from './components/Configuracoes'

export default function Dashboard() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [totalMes, setTotalMes] = useState(0)
  const [telaAtiva, setTelaAtiva] = useState<'dashboard' | 'adicionar' | 'recibo' | 'lista' | 'metas' | 'config'>('dashboard')
  const [gastosPorCategoria, setGastosPorCategoria] = useState<Record<string, number>>({})

  useEffect(() => {
    carregarGastos()
  }, [])

  async function carregarGastos() {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .order('data', { ascending: false })

      if (error) throw error

      if (data) {
        setGastos(data)
        calcularTotais(data)
      }
    } catch (error) {
      console.error('Erro ao carregar gastos:', error)
    }
  }

  function calcularTotais(gastosData: Gasto[]) {
    const mesAtual = new Date().getMonth()
    const anoAtual = new Date().getFullYear()

    const gastosMes = gastosData.filter(g => {
      const dataGasto = new Date(g.data)
      return dataGasto.getMonth() === mesAtual && dataGasto.getFullYear() === anoAtual
    })

    const total = gastosMes.reduce((acc, g) => acc + Number(g.valor), 0)
    setTotalMes(total)

    // Calcular por categoria
    const porCategoria: Record<string, number> = {}
    gastosMes.forEach(g => {
      porCategoria[g.categoria] = (porCategoria[g.categoria] || 0) + Number(g.valor)
    })
    setGastosPorCategoria(porCategoria)
  }

  const handleGastoAdicionado = () => {
    carregarGastos()
    setTelaAtiva('dashboard')
    toast.success('Gasto registrado com sucesso! Já atualizei seu painel financeiro.')
  }

  if (telaAtiva === 'adicionar') {
    return <AdicionarGasto onVoltar={() => setTelaAtiva('dashboard')} onSalvar={handleGastoAdicionado} />
  }

  if (telaAtiva === 'recibo') {
    return <RegistrarRecibo onVoltar={() => setTelaAtiva('dashboard')} onSalvar={handleGastoAdicionado} />
  }

  if (telaAtiva === 'lista') {
    return <ListaGastos gastos={gastos} onVoltar={() => setTelaAtiva('dashboard')} />
  }

  if (telaAtiva === 'metas') {
    return <MetasFinanceiras onVoltar={() => setTelaAtiva('dashboard')} gastosPorCategoria={gastosPorCategoria} />
  }

  if (telaAtiva === 'config') {
    return <Configuracoes onVoltar={() => setTelaAtiva('dashboard')} />
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">FinanceZen</h1>
          <p className="text-gray-600">Organize suas finanças com inteligência</p>
        </div>

        {/* Total do Mês */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-gray-50 to-white border-2 border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total gasto este mês</p>
              <p className="text-4xl font-bold text-black">
                R$ {totalMes.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-black" />
          </div>
        </Card>

        {/* Gráfico por Categoria */}
        {Object.keys(gastosPorCategoria).length > 0 && (
          <Card className="p-6 mb-6 border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-black" />
              <h2 className="text-xl font-bold text-black">Gastos por Categoria</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(gastosPorCategoria).map(([categoria, valor]) => {
                const porcentagem = (valor / totalMes) * 100
                return (
                  <div key={categoria}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{categoria}</span>
                      <span className="text-sm font-bold text-black">R$ {valor.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-black h-2 rounded-full transition-all"
                        style={{ width: `${porcentagem}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Botões de Ação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => setTelaAtiva('adicionar')}
            className="h-24 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold"
          >
            <Plus className="w-6 h-6 mr-2" />
            Adicionar Gasto
          </Button>

          <Button
            onClick={() => setTelaAtiva('recibo')}
            className="h-24 bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold"
          >
            <Camera className="w-6 h-6 mr-2" />
            Tirar Foto do Recibo
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            onClick={() => setTelaAtiva('lista')}
            variant="outline"
            className="h-16 border-2 border-black text-black hover:bg-black hover:text-white"
          >
            <List className="w-5 h-5 mr-2" />
            Ver Gastos
          </Button>

          <Button
            onClick={() => setTelaAtiva('metas')}
            variant="outline"
            className="h-16 border-2 border-black text-black hover:bg-black hover:text-white"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Metas
          </Button>

          <Button
            onClick={() => setTelaAtiva('config')}
            variant="outline"
            className="h-16 border-2 border-black text-black hover:bg-black hover:text-white"
          >
            <Settings className="w-5 h-5 mr-2" />
            Configurações
          </Button>
        </div>
      </div>
    </div>
  )
}
