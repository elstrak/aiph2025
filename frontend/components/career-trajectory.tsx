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
  Star,
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
  items: GapItem[] // Gap items from API
  notes: string
}

interface GapItem {
  name: string
  kind: "skill" | "experience" | "level"
  priority: number
  prerequisites: string[]
  recommendations: any[]
  rationale?: string
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
  estimatedMonths?: number
  hoursPerWeek?: number
  skills?: any[] // GapItem array from API
}

interface Resource {
  id: string
  title: string
  type: "course" | "job" | "article" | "certification" | "project" | "tip"
  provider: string
  url: string
  rating: number
  duration?: string
  salary?: string
  liked?: boolean
  disliked?: boolean
  description?: string
  location?: string
  hoursPerWeek?: number
  duration_hours?: number
  estimated_months?: number
  expected_outcomes?: string
  cost?: string
  required?: boolean
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

      {/* Interactive Timeline */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Детальная временная шкала развития
              </CardTitle>
              <CardDescription>Пошаговый план карьерного роста с подробностями</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Positions Step */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 text-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors"
                         onClick={() => setSelectedStep({
                           id: "current",
                           title: "Текущие позиции",
                           description: `Анализ ${trajectoryData.current_positions.length} подходящих вакансий на текущем уровне`,
                           type: "job" as const,
                           status: "completed" as const,
                           startDate: new Date(),
                           endDate: new Date(),
                           resources: trajectoryData.current_positions.map(pos => ({
                             id: pos.idx.toString(),
                             title: pos.title,
                             type: "job" as const,
                             provider: pos.company,
                             url: "#",
                             rating: 4.5,
                             salary: pos.salary,
                             description: pos.description,
                             location: pos.location || "Удаленно"
                           }))
                         })}>
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="w-0.5 h-16 bg-border mt-2" />
                  </div>
                  <div className="flex-1 pb-8">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedStep({
                            id: "current",
                            title: "Текущие позиции",
                            description: `Анализ ${trajectoryData.current_positions.length} подходящих вакансий на текущем уровне`,
                            type: "job" as const,
                            status: "completed" as const,
                            startDate: new Date(),
                            endDate: new Date(),
                            resources: trajectoryData.current_positions.map(pos => ({
                              id: pos.idx.toString(),
                              title: pos.title,
                              type: "job" as const,
                              provider: pos.company,
                              url: "#",
                              rating: 4.5,
                              salary: pos.salary,
                              description: pos.description,
                              location: pos.location || "Удаленно"
                            }))
                          })}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Текущие позиции</CardTitle>
                          <Badge variant="outline">Вакансии</Badge>
                        </div>
                        <CardDescription>
                          Подходящие вакансии на вашем текущем уровне ({trajectoryData.current_positions.length} шт.)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {trajectoryData.current_positions.length} вакансий
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Готов к подаче
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Learning Groups Steps */}
                {trajectoryData.groups.map((group, index) => (
                  <div key={group.group_id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 border-2 border-purple-500 text-purple-600 flex items-center justify-center cursor-pointer hover:bg-purple-200 transition-colors"
                           onClick={() => setSelectedStep({
                             id: group.group_id.toString(),
                             title: group.title,
                             description: group.notes,
                             type: "skill" as const,
                             status: index === 0 ? "current" as const : "upcoming" as const,
                             startDate: new Date(),
                             endDate: new Date(),
                             resources: group.items?.length > 0 ? 
                               // Use real AI recommendations from GapItem.recommendations
                               group.items.flatMap((gapItem: any, gapIndex: number) => 
                                 gapItem.recommendations?.map((rec: any, recIndex: number) => ({
                                   id: `${group.group_id}-${gapIndex}-${recIndex}`,
                                   title: rec.title || `${gapItem.name} - Рекомендация ${recIndex + 1}`,
                                   type: rec.type as "course" | "project" | "tip",
                                   provider: rec.provider || "AI Рекомендация",
                                   url: rec.url || "#",
                                   rating: 4.5,
                                   duration_hours: rec.duration_hours,
                                   estimated_months: rec.estimated_months,
                                   expected_outcomes: rec.expected_outcomes,
                                   cost: rec.cost,
                                   required: rec.required || false,
                                   description: rec.expected_outcomes // Use expected_outcomes as description
                                 })) || []
                               ) :
                               // Fallback mock data when no real recommendations
                               [
                                 {
                                   id: `${group.group_id}-fallback-course`,
                                   title: `${group.title} - Курс`,
                                   type: "course" as const,
                                   provider: "Рекомендованный провайдер",
                                   url: "#",
                                   rating: 4.5,
                                   duration: `${Math.ceil(group.estimated_months * 4)} недель`,
                                   description: `Изучение ${group.title.toLowerCase()}. ${group.notes}`,
                                   hoursPerWeek: group.hours_per_week
                                 },
                                 {
                                   id: `${group.group_id}-fallback-project`,
                                   title: `Проект: ${group.title}`,
                                   type: "project" as const,
                                   provider: "Самостоятельно",
                                   url: "#",
                                   rating: 4.0,
                                   duration_hours: 40,
                                   estimated_months: 1,
                                   expected_outcomes: `Практическое применение навыков ${group.title.toLowerCase()}`,
                                   cost: "Бесплатно"
                                 }
                               ],
                             estimatedMonths: group.estimated_months,
                             hoursPerWeek: group.hours_per_week,
                             skills: group.items || []
                           })}>
                        <BookOpen className="h-5 w-5" />
                      </div>
                      {index < trajectoryData.groups.length && <div className="w-0.5 h-16 bg-border mt-2" />}
                    </div>
                    <div className="flex-1 pb-8">
                      <Card className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedStep({
                              id: group.group_id.toString(),
                              title: group.title,
                              description: group.notes,
                              type: "skill" as const,
                              status: index === 0 ? "current" as const : "upcoming" as const,
                              startDate: new Date(),
                              endDate: new Date(),
                              resources: group.items?.length > 0 ? 
                                // Use real AI recommendations from GapItem.recommendations
                                group.items.flatMap((gapItem: any, gapIndex: number) => 
                                  gapItem.recommendations?.map((rec: any, recIndex: number) => ({
                                    id: `${group.group_id}-${gapIndex}-${recIndex}`,
                                    title: rec.title || `${gapItem.name} - Рекомендация ${recIndex + 1}`,
                                    type: rec.type as "course" | "project" | "tip",
                                    provider: rec.provider || "AI Рекомендация",
                                    url: rec.url || "#",
                                    rating: 4.5,
                                    duration_hours: rec.duration_hours,
                                    estimated_months: rec.estimated_months,
                                    expected_outcomes: rec.expected_outcomes,
                                    cost: rec.cost,
                                    required: rec.required || false,
                                    description: rec.expected_outcomes // Use expected_outcomes as description
                                  })) || []
                                ) :
                                // Fallback mock data when no real recommendations
                                [
                                  {
                                    id: `${group.group_id}-fallback-course`,
                                    title: `${group.title} - Курс`,
                                    type: "course" as const,
                                    provider: "Рекомендованный провайдер",
                                    url: "#",
                                    rating: 4.5,
                                    duration: `${Math.ceil(group.estimated_months * 4)} недель`,
                                    description: `Изучение ${group.title.toLowerCase()}. ${group.notes}`,
                                    hoursPerWeek: group.hours_per_week
                                  },
                                  {
                                    id: `${group.group_id}-fallback-project`,
                                    title: `Проект: ${group.title}`,
                                    type: "project" as const,
                                    provider: "Самостоятельно",
                                    url: "#",
                                    rating: 4.0,
                                    duration_hours: 40,
                                    estimated_months: 1,
                                    expected_outcomes: `Практическое применение навыков ${group.title.toLowerCase()}`,
                                    cost: "Бесплатно"
                                  }
                                ],
                              estimatedMonths: group.estimated_months,
                              hoursPerWeek: group.hours_per_week,
                              skills: group.items || []
                            })}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{group.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Обучение</Badge>
                              {index === 0 && (
                                <Badge variant="default" className="bg-blue-600">
                                  Текущий этап
                                </Badge>
                              )}
                            </div>
                          </div>
                          <CardDescription>{group.notes}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {group.estimated_months} мес.
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {group.hours_per_week} ч/нед
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {group.items?.length || 3} курсов
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}

                {/* Future Positions Step */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-green-500 text-green-600 flex items-center justify-center cursor-pointer hover:bg-green-200 transition-colors"
                         onClick={() => setSelectedStep({
                           id: "future",
                           title: "Целевые позиции",
                           description: `${trajectoryData.future_positions.length} вакансий следующего уровня для достижения ваших целей`,
                           type: "job" as const,
                           status: "upcoming" as const,
                           startDate: new Date(),
                           endDate: new Date(),
                           resources: trajectoryData.future_positions.map(pos => ({
                             id: pos.idx.toString(),
                             title: pos.title,
                             type: "job" as const,
                             provider: pos.company,
                             url: "#",
                             rating: 4.5,
                             salary: pos.salary,
                             description: pos.description,
                             location: pos.location || "Удаленно"
                           }))
                         })}>
                      <Target className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex-1 pb-8">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedStep({
                            id: "future",
                            title: "Целевые позиции",
                            description: `${trajectoryData.future_positions.length} вакансий следующего уровня для достижения ваших целей`,
                            type: "job" as const,
                            status: "upcoming" as const,
                            startDate: new Date(),
                            endDate: new Date(),
                            resources: trajectoryData.future_positions.map(pos => ({
                              id: pos.idx.toString(),
                              title: pos.title,
                              type: "job" as const,
                              provider: pos.company,
                              url: "#",
                              rating: 4.5,
                              salary: pos.salary,
                              description: pos.description,
                              location: pos.location || "Удаленно"
                            }))
                          })}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Целевые позиции</CardTitle>
                          <Badge variant="outline">Цель</Badge>
                        </div>
                        <CardDescription>
                          Вакансии следующего уровня ({trajectoryData.future_positions.length} шт.)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {trajectoryData.future_positions.length} вакансий
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            После обучения
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step Details Panel */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Детали этапа</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStep ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">{selectedStep.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{selectedStep.description}</p>
                  </div>

                  {/* Timeline info for learning groups */}
                  {selectedStep.type === "skill" && (selectedStep as any).estimatedMonths && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-medium text-purple-700">
                        <Clock className="h-4 w-4" />
                        План изучения
                      </div>
                      <div className="mt-2 text-sm text-purple-600">
                        <div>Продолжительность: {(selectedStep as any).estimatedMonths} месяцев</div>
                        <div>Нагрузка: {(selectedStep as any).hoursPerWeek} часов в неделю</div>
                      </div>
                    </div>
                  )}

                  {/* Skills to acquire */}
                  {selectedStep.type === "skill" && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-2">
                        <CheckSquare className="h-4 w-4" />
                        Навыки для изучения
                      </div>
                      <div className="space-y-2">
                        {(selectedStep as any).skills && (selectedStep as any).skills.length > 0 ? (
                          (selectedStep as any).skills.map((skill: any, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                skill.priority === 1 ? 'bg-red-500' : 
                                skill.priority === 2 ? 'bg-orange-500' : 
                                skill.priority === 3 ? 'bg-yellow-500' : 
                                'bg-green-500'
                              }`} />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-blue-900">{skill.name}</div>
                                <div className="text-xs text-blue-600 capitalize">
                                  {skill.kind === 'skill' ? '🎯 Навык' : 
                                   skill.kind === 'experience' ? '💼 Опыт' : 
                                   '📈 Уровень'}
                                  {skill.priority && ` • Приоритет ${skill.priority}`}
                                </div>
                                {skill.rationale && (
                                  <div className="text-xs text-blue-500 mt-1">{skill.rationale}</div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          // Fallback example skills when no real data
                          [
                            { name: "Продвинутый Python", kind: "skill", priority: 1, rationale: "Основной язык для анализа данных" },
                            { name: "Machine Learning", kind: "skill", priority: 1, rationale: "Ключевой навык для Data Science" },
                            { name: "SQL оптимизация", kind: "skill", priority: 2, rationale: "Для работы с большими данными" },
                            { name: "Опыт работы с A/B тестами", kind: "experience", priority: 2, rationale: "Необходим для продуктовой аналитики" },
                            { name: "Senior уровень", kind: "level", priority: 3, rationale: "Целевой уровень развития" }
                          ].map((skill, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                skill.priority === 1 ? 'bg-red-500' : 
                                skill.priority === 2 ? 'bg-orange-500' : 
                                skill.priority === 3 ? 'bg-yellow-500' : 
                                'bg-green-500'
                              }`} />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-blue-900">{skill.name}</div>
                                <div className="text-xs text-blue-600 capitalize">
                                  {skill.kind === 'skill' ? '🎯 Навык' : 
                                   skill.kind === 'experience' ? '💼 Опыт' : 
                                   '📈 Уровень'}
                                  {skill.priority && ` • Приоритет ${skill.priority}`}
                                </div>
                                {skill.rationale && (
                                  <div className="text-xs text-blue-500 mt-1">{skill.rationale}</div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="mt-2 text-xs text-blue-600">
                        💡 Цветные точки показывают приоритет: 🔴 Высокий → 🟢 Низкий
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {selectedStep.type === "job" && (
                      <Button className="flex-1" onClick={() => console.log("Navigate to jobs")}>
                        <Briefcase className="h-4 w-4 mr-2" />
                        Смотреть вакансии
                      </Button>
                    )}
                    {selectedStep.type === "skill" && (
                      <Button className="flex-1" onClick={() => console.log("Navigate to courses")}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Смотреть курсы
                      </Button>
                    )}
                  </div>

                  {/* Resources list */}
                  <div>
                    <h5 className="font-medium text-sm mb-3">
                      {selectedStep.type === "job" ? "Подходящие вакансии:" : "🤖 AI-рекомендации для изучения:"}
                    </h5>
                    {selectedStep.type === "skill" && selectedStep.resources.length > 0 && (
                      <div className="mb-3 p-2 bg-green-50 rounded text-xs text-green-700">
                        💡 Персональные рекомендации от YandexGPT на основе анализа ваших целей
                      </div>
                    )}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedStep.resources.map((resource) => (
                        <Card key={resource.id} className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h6 className="font-medium text-sm">{resource.title}</h6>
                                <p className="text-xs text-muted-foreground">{resource.provider}</p>
                                
                                {/* Job specific info */}
                                {resource.type === "job" && (
                                  <>
                                    {(resource as any).salary && (
                                      <p className="text-xs text-green-600 font-medium">{(resource as any).salary}</p>
                                    )}
                                    {(resource as any).location && (
                                      <p className="text-xs text-muted-foreground">📍 {(resource as any).location}</p>
                                    )}
                                    {(resource as any).description && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {(resource as any).description}
                                      </p>
                                    )}
                                  </>
                                )}
                                
                                {/* Course specific info */}
                                {resource.type === "course" && (
                                  <>
                                    {resource.duration && (
                                      <p className="text-xs text-muted-foreground">⏱️ {resource.duration}</p>
                                    )}
                                    {(resource as any).hoursPerWeek && (
                                      <p className="text-xs text-muted-foreground">📚 {(resource as any).hoursPerWeek} ч/нед</p>
                                    )}
                                    {(resource as any).description && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {(resource as any).description}
                                      </p>
                                    )}
                                  </>
                                )}

                                {/* Project specific info */}
                                {resource.type === "project" && (
                                  <>
                                    {(resource as any).duration_hours && (
                                      <p className="text-xs text-muted-foreground">⏱️ {(resource as any).duration_hours} часов</p>
                                    )}
                                    {(resource as any).estimated_months && (
                                      <p className="text-xs text-muted-foreground">📅 {(resource as any).estimated_months} мес.</p>
                                    )}
                                    {(resource as any).expected_outcomes && (
                                      <p className="text-xs text-blue-600 mt-1 font-medium">🎯 {(resource as any).expected_outcomes}</p>
                                    )}
                                    {(resource as any).cost && (
                                      <p className="text-xs text-green-600">💰 {(resource as any).cost}</p>
                                    )}
                                  </>
                                )}

                                {/* Tip specific info */}
                                {resource.type === "tip" && (
                                  <>
                                    {(resource as any).expected_outcomes && (
                                      <p className="text-xs text-purple-600 mt-1 font-medium">💡 {(resource as any).expected_outcomes}</p>
                                    )}
                                    {(resource as any).duration_hours && (
                                      <p className="text-xs text-muted-foreground">⏱️ {(resource as any).duration_hours} часов</p>
                                    )}
                                  </>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {resource.type === "job" ? "Вакансия" : 
                                 resource.type === "course" ? "Курс" :
                                 resource.type === "project" ? "Проект" :
                                 resource.type === "tip" ? "Совет" : "Ресурс"}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                                  {resource.rating}
                                </span>
                              </div>
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Открыть
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Выберите этап на временной шкале для просмотра подробной информации
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
