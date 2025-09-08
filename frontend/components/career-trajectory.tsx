"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Play,
  Pause,
  CheckCircle,
  Circle,
  Clock,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Target,
  BookOpen,
  Briefcase,
  TrendingUp,
  CheckSquare,
} from "lucide-react"

// Real API data interfaces
interface Position {
  idx: number
  title: string
  company: string
  location: string | null
  salary: string
  experience: string
  description: string
}

interface LearningGroup {
  group_id: number
  title: string
  estimated_months: number
  hours_per_week: number
  items: any[] // Course items
  notes: string
}

interface TrajectoryData {
  session_id: string
  current_positions: Position[]
  future_positions: Position[]
  groups: LearningGroup[]
}

// Legacy interfaces for backward compatibility
interface TrajectoryStep {
  id: string
  title: string
  description: string
  type: "skill" | "course" | "job" | "milestone"
  status: "completed" | "current" | "upcoming"
  startDate: Date
  endDate: Date
  resources: Resource[]
  requirements?: string[]
}

interface Resource {
  id: string
  title: string
  type: "course" | "job" | "article" | "certification"
  provider: string
  url: string
  rating: number
  duration?: string
  salary?: string
  liked?: boolean
  disliked?: boolean
}

interface Trajectory {
  id: string
  name: string
  description: string
  status: "active" | "paused" | "completed"
  progress: number
  startDate: Date
  estimatedEndDate: Date
  steps: TrajectoryStep[]
}

export function CareerTrajectory() {
  const [selectedTrajectory, setSelectedTrajectory] = useState<string>("1")
  const [selectedStep, setSelectedStep] = useState<TrajectoryStep | null>(null)
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load trajectory data from localStorage
  useEffect(() => {
    const loadTrajectoryData = () => {
      try {
        const savedData = localStorage.getItem('career_trajectory_data')
        if (savedData) {
          const data: TrajectoryData = JSON.parse(savedData)
          setTrajectoryData(data)
          console.log('Trajectory data loaded:', data)
        } else {
          console.log('No trajectory data found in localStorage')
        }
      } catch (error) {
        console.error('Error loading trajectory data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTrajectoryData()
  }, [])

  // Mock trajectory data
  const trajectories: Trajectory[] = [
    {
      id: "1",
      name: "Frontend Developer → Senior Frontend",
      description: "Развитие от Middle до Senior Frontend Developer",
      status: "active",
      progress: 45,
      startDate: new Date("2024-01-01"),
      estimatedEndDate: new Date("2024-12-31"),
      steps: [
        {
          id: "1",
          title: "Углубленное изучение React",
          description: "Изучение продвинутых паттернов React, хуков, контекста",
          type: "skill",
          status: "completed",
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-02-15"),
          resources: [
            {
              id: "1",
              title: "Advanced React Patterns",
              type: "course",
              provider: "Epic React",
              url: "#",
              rating: 4.8,
              duration: "40 часов",
              liked: true,
            },
            {
              id: "2",
              title: "React Performance Optimization",
              type: "article",
              provider: "React.dev",
              url: "#",
              rating: 4.5,
            },
          ],
        },
        {
          id: "2",
          title: "Изучение TypeScript",
          description: "Освоение TypeScript для типобезопасной разработки",
          type: "skill",
          status: "current",
          startDate: new Date("2024-02-16"),
          endDate: new Date("2024-04-01"),
          resources: [
            {
              id: "3",
              title: "TypeScript Fundamentals",
              type: "course",
              provider: "TypeScript Lang",
              url: "#",
              rating: 4.7,
              duration: "25 часов",
            },
            {
              id: "4",
              title: "TypeScript in React Projects",
              type: "certification",
              provider: "Microsoft",
              url: "#",
              rating: 4.6,
            },
          ],
          requirements: ["Знание JavaScript ES6+", "Опыт работы с React"],
        },
        {
          id: "3",
          title: "Архитектура фронтенд приложений",
          description: "Изучение паттернов архитектуры и state management",
          type: "skill",
          status: "upcoming",
          startDate: new Date("2024-04-02"),
          endDate: new Date("2024-06-01"),
          resources: [
            {
              id: "5",
              title: "Frontend Architecture Patterns",
              type: "course",
              provider: "Frontend Masters",
              url: "#",
              rating: 4.9,
              duration: "35 часов",
            },
          ],
        },
        {
          id: "4",
          title: "Поиск Senior позиции",
          description: "Активный поиск и собеседования на Senior Frontend позицию",
          type: "job",
          status: "upcoming",
          startDate: new Date("2024-06-01"),
          endDate: new Date("2024-08-01"),
          resources: [
            {
              id: "6",
              title: "Senior Frontend Developer",
              type: "job",
              provider: "Яндекс",
              url: "#",
              rating: 4.5,
              salary: "250,000 - 350,000 ₽",
            },
            {
              id: "7",
              title: "Lead Frontend Developer",
              type: "job",
              provider: "Сбер",
              url: "#",
              rating: 4.3,
              salary: "300,000 - 400,000 ₽",
            },
          ],
        },
      ],
    },
    {
      id: "2",
      name: "Переход в Product Management",
      description: "Смена карьерного направления на продуктовое управление",
      status: "paused",
      progress: 20,
      startDate: new Date("2024-01-15"),
      estimatedEndDate: new Date("2025-06-01"),
      steps: [
        {
          id: "5",
          title: "Основы Product Management",
          description: "Изучение базовых принципов продуктового управления",
          type: "course",
          status: "completed",
          startDate: new Date("2024-01-15"),
          endDate: new Date("2024-03-01"),
          resources: [
            {
              id: "8",
              title: "Product Management Fundamentals",
              type: "course",
              provider: "Product School",
              url: "#",
              rating: 4.6,
              duration: "50 часов",
              liked: true,
            },
          ],
        },
      ],
    },
  ]

  const currentTrajectory = trajectories.find((t) => t.id === selectedTrajectory)

  const handleTrajectoryAction = (action: "play" | "pause") => {
    console.log(`${action} trajectory ${selectedTrajectory}`)
    // Here would be the logic to start/pause trajectory
  }

  const handleStepComplete = (stepId: string) => {
    console.log(`Complete step ${stepId}`)
    // Here would be the logic to mark step as completed
  }

  const handleResourceAction = (resourceId: string, action: "like" | "dislike" | "visit") => {
    console.log(`${action} resource ${resourceId}`)
    // Here would be the logic to handle resource actions
  }

  const handleNavigateToTab = (tab: "jobs-courses", filter?: any) => {
    // This would be handled by parent component or context
    console.log(`Navigate to ${tab} with filter:`, filter)
    // In real implementation, this would trigger tab change and apply filters
  }

  const getStepIcon = (step: TrajectoryStep) => {
    switch (step.type) {
      case "skill":
        return <TrendingUp className="h-4 w-4" />
      case "course":
        return <BookOpen className="h-4 w-4" />
      case "job":
        return <Briefcase className="h-4 w-4" />
      case "milestone":
        return <Target className="h-4 w-4" />
      default:
        return <Circle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "current":
        return "text-blue-600"
      case "upcoming":
        return "text-gray-400"
      default:
        return "text-gray-400"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Карьерные траектории</CardTitle>
            <CardDescription>Загрузка данных...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Загружаем вашу траекторию...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!trajectoryData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Карьерные траектории</CardTitle>
            <CardDescription>Нет доступных данных</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Траектория не построена</h3>
              <p className="text-muted-foreground mb-4">
                Сначала пройдите интервью с AI и постройте траекторию во вкладке "Чат с AI"
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Trajectory Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Ваша карьерная траектория</CardTitle>
              <CardDescription>Персональный план развития на основе AI-анализа</CardDescription>
            </div>
            <Badge variant="default">Активная</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{trajectoryData.current_positions.length}</div>
              <div className="text-sm text-blue-600">Текущие позиции</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{trajectoryData.future_positions.length}</div>
              <div className="text-sm text-green-600">Целевые позиции</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{trajectoryData.groups.length}</div>
              <div className="text-sm text-purple-600">Групп обучения</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links to Other Tabs */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.hash = '#vacancies'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Подходящие вакансии
            </CardTitle>
            <CardDescription>
              {trajectoryData.current_positions.length} текущих + {trajectoryData.future_positions.length} целевых позиций
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Посмотреть все вакансии во вкладке "Вакансии"
              </div>
              <Button variant="outline" size="sm">
                Перейти →
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.hash = '#courses'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              План обучения
            </CardTitle>
            <CardDescription>
              {trajectoryData.groups.length} групп курсов для развития навыков
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Посмотреть все курсы во вкладке "Курсы"
              </div>
              <Button variant="outline" size="sm">
                Перейти →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Временная шкала развития
          </CardTitle>
          <CardDescription>Рекомендуемая последовательность изучения</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trajectoryData.groups.map((group, index) => (
              <div key={group.group_id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium">{group.title}</h4>
                  <p className="text-sm text-muted-foreground">{group.notes}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-medium">{group.estimated_months} мес.</div>
                  <div className="text-xs text-muted-foreground">{group.hours_per_week} ч/нед</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
