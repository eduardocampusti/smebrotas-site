const zaiApiKey = import.meta.env.VITE_ZAI_API_KEY
const zaiEndpoint = import.meta.env.VITE_ZAI_API_URL ?? 'https://api.z.ai/api/paas/v4/chat/completions'

if (!zaiApiKey) {
  throw new Error('VITE_ZAI_API_KEY não está definido. Copie .env.example para .env e preencha a chave.')
}

export type ZaiMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function zaiChatCompletion(
  prompt: string,
  options: {
    model?: string
    systemMessage?: string
    extraMessages?: ZaiMessage[]
  } = {}
): Promise<string> {
  const body = {
    model: options.model ?? 'glm-5.1',
    messages: [
      {
        role: 'system',
        content: options.systemMessage ?? 'Você é um assistente útil.'
      },
      ...(options.extraMessages ?? []),
      {
        role: 'user',
        content: prompt
      }
    ]
  }

  const response = await fetch(zaiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${zaiApiKey}`
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Z.AI API retornou ${response.status}: ${text}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content ?? ''
}
