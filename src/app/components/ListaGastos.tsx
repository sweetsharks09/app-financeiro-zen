"use client"

import { ArrowLeft, Calendar, Tag, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { type Gasto } from '@/lib/supabase'

interface Props {
  gastos: Gasto[]
  onVoltar: () => void
}

export default function ListaGastos({ gastos, onVoltar }: Props) {
  // Agrupar gastos por mês
  const gastosPorMes = gastos.reduce((acc, gasto) => {
    const data = new Date(gasto.data)
    const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`
    
    if (!acc[mesAno]) {
      acc[mesAno] = []
    }
    acc[mesAno].push(gasto)
    return acc
  }, {} as Record<string, Gasto[]>)

  function formatarData(dataStr: string) {
    const data = new Date(dataStr)
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function formatarMesAno(mesAno: string) {
    const [mes, ano] = mesAno.split('/')
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return `${meses[parseInt(mes) - 1]} ${ano}`
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

        <h1 className="text-3xl font-bold text-black mb-6">Lista de Gastos</h1>

        {gastos.length === 0 ? (
          <Card className="p-8 text-center border-2 border-gray-200">
            <p className="text-gray-600">Nenhum gasto registrado ainda</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(gastosPorMes).map(([mesAno, gastosDoMes]) => {
              const totalMes = gastosDoMes.reduce((acc, g) => acc + Number(g.valor), 0)
              
              return (
                <div key={mesAno}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-black">{formatarMesAno(mesAno)}</h2>
                    <span className="text-lg font-semibold text-black">
                      R$ {totalMes.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {gastosDoMes.map(gasto => (
                      <Card key={gasto.id} className="p-4 border-2 border-gray-200 hover:border-black transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Tag className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-600">{gasto.categoria}</span>
                            </div>
                            <p className="font-semibold text-black mb-1">{gasto.descricao}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {formatarData(gasto.data)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-xl font-bold text-red-600">
                              <DollarSign className="w-5 h-5" />
                              {Number(gasto.valor).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
