// ZenBot - Assistente de IA para categorização e OCR
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
})

export interface OcrResult {
  valor?: number
  data?: string
  estabelecimento?: string
  descricao?: string
  categoria?: string
  confianca: number
}

// Categorias e palavras-chave
const categoriasMap: Record<string, string[]> = {
  'Alimentação': ['mercado', 'supermercado', 'padaria', 'restaurante', 'lanchonete', 'açougue', 'hortifruti'],
  'Saúde': ['farmácia', 'drogaria', 'hospital', 'clínica', 'médico', 'dentista'],
  'Transporte': ['uber', '99', 'gasolina', 'posto', 'combustível', 'ônibus', 'metrô', 'estacionamento'],
  'Lazer': ['shopping', 'cinema', 'teatro', 'parque', 'roupas', 'calçados', 'livro'],
  'Contas Fixas': ['água', 'luz', 'energia', 'aluguel', 'telefone', 'internet', 'condomínio'],
  'Educação': ['escola', 'faculdade', 'curso', 'livro', 'material escolar'],
  'Outros': []
}

export async function processarRecibo(imagemBase64: string): Promise<OcrResult> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é o ZenBot, assistente de finanças. Analise a imagem do recibo e extraia:
- valor total (número)
- data da compra (formato YYYY-MM-DD)
- nome do estabelecimento
- descrição breve do que foi comprado
- categoria sugerida (Alimentação, Transporte, Saúde, Lazer, Contas Fixas, Educação, Outros)

Retorne APENAS um JSON válido com esses campos. Se não conseguir identificar algum campo, use null.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imagemBase64
              }
            }
          ]
        }
      ],
      max_tokens: 500
    })

    const resultado = response.choices[0].message.content
    if (!resultado) throw new Error('Resposta vazia da IA')

    const dados = JSON.parse(resultado)
    
    return {
      valor: dados.valor,
      data: dados.data,
      estabelecimento: dados.estabelecimento,
      descricao: dados.descricao,
      categoria: dados.categoria || categorizarAutomatico(dados.estabelecimento || ''),
      confianca: 0.85
    }
  } catch (error) {
    console.error('Erro ao processar recibo:', error)
    return {
      confianca: 0,
      categoria: 'Outros'
    }
  }
}

export function categorizarAutomatico(texto: string): string {
  const textoLower = texto.toLowerCase()
  
  for (const [categoria, palavrasChave] of Object.entries(categoriasMap)) {
    for (const palavra of palavrasChave) {
      if (textoLower.includes(palavra)) {
        return categoria
      }
    }
  }
  
  return 'Outros'
}

export function verificarMeta(categoria: string, valorGasto: number, valorLimite: number): boolean {
  return valorGasto > valorLimite
}

export function gerarMensagemSucesso(): string {
  return "Gasto registrado com sucesso! Já atualizei seu painel financeiro."
}

export function gerarAlertaMeta(categoria: string): string {
  return `Atenção! Você ultrapassou a meta da categoria ${categoria}.`
}
