"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Send, Bot, User, FileText, Plus, Edit } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface TrajectoryOption {
  id: string
  name: string
  description: string
  lastUpdated: Date
}

export function CareerChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Привет! Я ваш AI-компаньон по карьерному развитию. Давайте построим или обновим вашу карьерную траекторию. Что вы хотели бы сделать?",
      timestamp: new Date(),
    },
  ])

  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTrajectory, setSelectedTrajectory] = useState<string>("")
  const [trajectoryMode, setTrajectoryMode] = useState<"new" | "edit" | "">("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [saveToProfile, setSaveToProfile] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock existing trajectories
  const existingTrajectories: TrajectoryOption[] = [
    {
      id: "1",
      name: "Frontend Developer → Senior Frontend",
      description: "Развитие в области фронтенд-разработки",
      lastUpdated: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Переход в Product Management",
      description: "Смена направления на продуктовое управление",
      lastUpdated: new Date("2024-01-10"),
    },
  ]

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !uploadedFile) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: uploadedFile ? `${inputMessage} [Прикреплен файл: ${uploadedFile.name}]` : inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(userMessage.content, trajectoryMode, uploadedFile),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
      setUploadedFile(null)
    }, 1500)
  }

  const generateAIResponse = (userInput: string, mode: string, file: File | null): string => {
    if (file) {
      return `Отлично! Я проанализировал ваше резюме "${file.name}". Вижу, что у вас есть опыт в области разработки. Теперь расскажите мне больше о ваших карьерных целях: какую позицию вы хотели бы занимать через 2-3 года? Какие навыки хотели бы развить?`
    }

    if (mode === "new") {
      return `Создаем новую карьерную траекторию! Для начала мне нужно узнать о вас больше:
      
1. Какая у вас текущая профессиональная область?
2. Сколько лет опыта работы?
3. Какие ключевые навыки у вас есть?
4. Куда вы хотите развиваться?

Расскажите мне об этом, и я помогу построить персональный план развития.`
    }

    if (mode === "edit") {
      return `Отлично! Мы будем редактировать существующую траекторию "${existingTrajectories.find((t) => t.id === selectedTrajectory)?.name}". Что именно вы хотели бы изменить или дополнить в вашем плане развития?`
    }

    // General responses based on keywords
    if (userInput.toLowerCase().includes("навык")) {
      return `Понимаю, вы хотите развивать навыки. Какие конкретно компетенции вас интересуют? Например:
      
• Hard skills (технические навыки)
• Soft skills (коммуникация, лидерство)
• Инструменты и технологии
• Отраслевые знания

Расскажите подробнее, и я предложу конкретные курсы и практические шаги.`
    }

    return `Спасибо за информацию! Это поможет мне лучше понять ваши потребности. Можете рассказать больше деталей? Чем конкретнее будет информация, тем более персонализированные рекомендации я смогу дать.`
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const startNewTrajectory = () => {
    setTrajectoryMode("new")
    const message: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content:
        "Отлично! Давайте создадим новую карьерную траекторию. Сначала расскажите о своем текущем опыте и целях.",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, message])
  }

  const startEditTrajectory = () => {
    if (!selectedTrajectory) return
    setTrajectoryMode("edit")
    const trajectory = existingTrajectories.find((t) => t.id === selectedTrajectory)
    const message: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `Будем редактировать траекторию "${trajectory?.name}". Что вы хотели бы изменить или дополнить?`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, message])
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Chat Interface */}
      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Чат с AI-консультантом
            </CardTitle>
            <CardDescription>Обсудите свои карьерные цели и получите персональные рекомендации</CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col gap-4">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div
                        className={`rounded-lg p-3 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm">AI печатает...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* File Upload Area */}
            {uploadedFile && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{uploadedFile.name}</span>
                <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>
                  ×
                </Button>
              </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Textarea
                  placeholder="Напишите ваш вопрос или расскажите о карьерных целях..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="min-h-[60px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                </Button>
                <Button onClick={handleSendMessage} disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <div className="space-y-6">
        {/* Trajectory Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Режим работы</CardTitle>
            <CardDescription>Выберите, что вы хотите сделать</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant={trajectoryMode === "new" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={startNewTrajectory}
            >
              <Plus className="h-4 w-4 mr-2" />
              Создать новую траекторию
            </Button>

            <div className="space-y-2">
              <Label>Редактировать существующую</Label>
              <Select value={selectedTrajectory} onValueChange={setSelectedTrajectory}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите траекторию" />
                </SelectTrigger>
                <SelectContent>
                  {existingTrajectories.map((trajectory) => (
                    <SelectItem key={trajectory.id} value={trajectory.id}>
                      {trajectory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={trajectoryMode === "edit" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={startEditTrajectory}
                disabled={!selectedTrajectory}
              >
                <Edit className="h-4 w-4 mr-2" />
                Редактировать выбранную
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="save-profile">Сохранять в профиль</Label>
              <input
                id="save-profile"
                type="checkbox"
                checked={saveToProfile}
                onChange={(e) => setSaveToProfile(e.target.checked)}
                className="rounded"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Автоматически обновлять профиль на основе информации из чата
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-sm bg-transparent">
              Загрузить резюме
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm bg-transparent">
              Анализ рынка вакансий
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm bg-transparent">
              Рекомендации курсов
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
