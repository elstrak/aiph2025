import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: openai("gpt-4"),
    system: `Вы - AI-консультант по карьерному развитию. Ваша задача:

1. Помогать пользователям строить карьерные траектории
2. Анализировать их навыки и опыт
3. Предлагать конкретные шаги для развития
4. Рекомендовать курсы и вакансии
5. Проводить структурированное интервью для сбора информации

Отвечайте на русском языке, будьте дружелюбны и профессиональны. 
Задавайте уточняющие вопросы для лучшего понимания целей пользователя.
Структурируйте свои ответы и давайте конкретные, actionable советы.`,
    messages,
  })

  return result.toDataStreamResponse()
}
