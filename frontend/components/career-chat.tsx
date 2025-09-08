"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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


export function CareerChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [interviewCompleted, setInterviewCompleted] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load saved session on component mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('career_session_id')
    if (savedSessionId) {
      console.log('Loading saved session:', savedSessionId)
      loadSession(savedSessionId)
    }
  }, [])

  // Create new session
  const createSession = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.session_id) {
        setSessionId(data.session_id)
        localStorage.setItem('career_session_id', data.session_id)
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Привет! Я ваш AI-консультант по карьерному развитию. Давайте проведем интервью, чтобы я мог лучше понять ваши цели и опыт. Расскажите о своей текущей профессиональной деятельности.",
          timestamp: new Date(),
        }
        setMessages([welcomeMessage])
        setInterviewCompleted(false)
      }
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  // Load existing session from MongoDB
  const loadSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions?sessionId=${sessionId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          // Session not found, clear localStorage
          localStorage.removeItem('career_session_id')
          return
        }
        throw new Error(`Failed to load session: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.session && data.messages) {
        setSessionId(sessionId)
        
        // Convert messages from API format to component format
        const convertedMessages: Message[] = data.messages.map((msg: any) => ({
          id: msg.message_id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }))
        
        setMessages(convertedMessages)
        
        // Check if interview is completed (last assistant message has done: true)
        const lastAssistantMessage = data.messages
          .filter((msg: any) => msg.role === 'assistant')
          .pop()
        
        if (lastAssistantMessage?.done) {
          setInterviewCompleted(true)
        }
        
        console.log(`Session restored: ${convertedMessages.length} messages`)
      }
    } catch (error) {
      console.error('Error loading session:', error)
      // Clear invalid session from localStorage
      localStorage.removeItem('career_session_id')
    }
  }

  // Send message to chat API
  const sendMessageToAPI = async (text: string) => {
    if (!sessionId) return

    try {
      const response = await fetch('/api/chat/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, text }),
      })
      
      const data = await response.json()
      
      if (data.reply) {
        const aiResponse: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiResponse])
        
        // Check if interview is completed
        if (data.done) {
          setInterviewCompleted(true)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant", 
        content: "Извините, произошла ошибка. Попробуйте еще раз.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }


  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !uploadedFile) return
    if (!sessionId) {
      console.error('No session ID')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: uploadedFile ? `${inputMessage} [Прикреплен файл: ${uploadedFile.name}]` : inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    setUploadedFile(null)

    // Send to real API
    await sendMessageToAPI(userMessage.content)
    setIsLoading(false)
  }


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const startNewTrajectory = async () => {
    // Clear previous session
    localStorage.removeItem('career_session_id')
    localStorage.removeItem('career_trajectory_data')
    setMessages([])
    setSessionId("")
    setInterviewCompleted(false)
    
    // Create new session
    await createSession()
  }

  // Build trajectory from completed interview
  const buildTrajectory = async () => {
    if (!sessionId) {
      console.error('No session ID for trajectory building')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/trajectory/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          weekly_hours: 10,      // Default values
          total_months: 12,      // Can be made configurable later
          target_positions_limit: 5,
          current_positions_limit: 5,
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Success! Show success message and maybe navigate to trajectory tab
      const successMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Отлично! Траектория построена успешно. Найдено ${data.current_positions?.length || 0} текущих вакансий и ${data.future_positions?.length || 0} целевых позиций. Перейдите во вкладку "Карьерная траектория" чтобы посмотреть детали.`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, successMessage])

      // Store trajectory data in localStorage for other components
      localStorage.setItem('career_trajectory_data', JSON.stringify(data))
      
    } catch (error) {
      console.error('Error building trajectory:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Извините, произошла ошибка при построении траектории: ${error instanceof Error ? error.message : String(error)}. Попробуйте еще раз.`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
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
        {/* Session Management */}
        <Card>
          <CardHeader>
            <CardTitle>Интервью с AI</CardTitle>
            <CardDescription>
              {!sessionId ? "Начните новое интервью" : 
               interviewCompleted ? "Интервью завершено!" : "Интервью в процессе"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!sessionId ? (
              <Button
                className="w-full justify-start"
                onClick={startNewTrajectory}
              >
                <Plus className="h-4 w-4 mr-2" />
                Начать интервью
              </Button>
            ) : interviewCompleted ? (
              <div className="space-y-2">
                <Button
                  className="w-full justify-start"
                  onClick={buildTrajectory}
                  disabled={isLoading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isLoading ? 'Строим траекторию...' : 'Построить траекторию'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={startNewTrajectory}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Начать новое интервью
                </Button>
              </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                              Продолжайте отвечать на вопросы AI для завершения интервью
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => {
                                localStorage.clear()
                                window.location.reload()
                              }}
                            >
                              🗑️ Сбросить сессию (для отладки)
                            </Button>
                          </div>
                        )}
          </CardContent>
        </Card>

        {/* Session Info */}
        {sessionId && (
          <Card>
            <CardHeader>
              <CardTitle>Информация о сессии</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <strong>ID сессии:</strong> {sessionId.slice(0, 8)}...
              </div>
              <div className="text-sm">
                <strong>Статус:</strong> {interviewCompleted ? 'Завершено' : 'В процессе'}
              </div>
            </CardContent>
          </Card>
        )}

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
