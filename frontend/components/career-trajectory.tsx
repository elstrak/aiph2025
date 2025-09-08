"use client"

import { useState } from "react"
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

  return (
    <div className="space-y-6">
      {/* Trajectory Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Карьерные траектории</CardTitle>
              <CardDescription>Управляйте своим профессиональным развитием</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedTrajectory} onValueChange={setSelectedTrajectory}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {trajectories.map((trajectory) => (
                    <SelectItem key={trajectory.id} value={trajectory.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant={trajectory.status === "active" ? "default" : "secondary"}>
                          {trajectory.status === "active"
                            ? "Активная"
                            : trajectory.status === "paused"
                              ? "На паузе"
                              : "Завершена"}
                        </Badge>
                        {trajectory.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {currentTrajectory && (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{currentTrajectory.name}</h3>
                <p className="text-sm text-muted-foreground">{currentTrajectory.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {currentTrajectory.status === "active" ? (
                  <Button variant="outline" onClick={() => handleTrajectoryAction("pause")}>
                    <Pause className="h-4 w-4 mr-2" />
                    Пауза
                  </Button>
                ) : (
                  <Button onClick={() => handleTrajectoryAction("play")}>
                    <Play className="h-4 w-4 mr-2" />
                    Запустить
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Прогресс: {currentTrajectory.progress}%</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  До {currentTrajectory.estimatedEndDate.toLocaleDateString()}
                </span>
              </div>
              <Progress value={currentTrajectory.progress} className="h-2" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-green-600" />
                  Имеющиеся компетенции
                </h4>
                <div className="flex flex-wrap gap-1">
                  {["React", "JavaScript", "CSS", "HTML", "Git"].map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Необходимые компетенции
                </h4>
                <div className="flex flex-wrap gap-1">
                  {["TypeScript", "System Design", "Leadership", "Mentoring"].map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Timeline */}
      {currentTrajectory && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Steps Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Дорожная карта</CardTitle>
                <CardDescription>Этапы вашего карьерного развития</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {currentTrajectory.steps.map((step, index) => (
                    <div key={step.id} className="flex gap-4">
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                            step.status === "completed"
                              ? "bg-green-100 border-green-500 text-green-600"
                              : step.status === "current"
                                ? "bg-blue-100 border-blue-500 text-blue-600"
                                : "bg-gray-100 border-gray-300 text-gray-400"
                          }`}
                        >
                          {step.status === "completed" ? <CheckCircle className="h-5 w-5" /> : getStepIcon(step)}
                        </div>
                        {index < currentTrajectory.steps.length - 1 && <div className="w-0.5 h-16 bg-border mt-2" />}
                      </div>

                      {/* Step content */}
                      <div className="flex-1 pb-8">
                        <Card
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedStep(step)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{step.title}</CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{step.type}</Badge>
                                {step.status === "current" && (
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStepComplete(step.id)
                                    }}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Завершить
                                  </Button>
                                )}
                              </div>
                            </div>
                            <CardDescription>{step.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {step.startDate.toLocaleDateString()} - {step.endDate.toLocaleDateString()}
                              </span>
                              <span>{step.resources.length} ресурсов</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step Details */}
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

                    <div className="flex gap-2">
                      {selectedStep.type === "job" && (
                        <Button
                          className="flex-1"
                          onClick={() =>
                            handleNavigateToTab("jobs-courses", {
                              type: "jobs",
                              trajectory: selectedTrajectory,
                              topic: "Frontend", // This would be dynamic based on trajectory
                            })
                          }
                        >
                          <Briefcase className="h-4 w-4 mr-2" />
                          Вакансии
                        </Button>
                      )}
                      {(selectedStep.type === "skill" || selectedStep.type === "course") && (
                        <Button
                          className="flex-1"
                          onClick={() =>
                            handleNavigateToTab("jobs-courses", {
                              type: "courses",
                              trajectory: selectedTrajectory,
                              topic: selectedStep.title, // Use step title as topic filter
                            })
                          }
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Курсы
                        </Button>
                      )}
                    </div>

                    {selectedStep.requirements && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Требования:</h5>
                        <ul className="text-sm space-y-1">
                          {selectedStep.requirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Circle className="h-2 w-2 fill-current" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h5 className="font-medium text-sm mb-3">Ресурсы:</h5>
                      <div className="space-y-3">
                        {selectedStep.resources.map((resource) => (
                          <Card key={resource.id} className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h6 className="font-medium text-sm">{resource.title}</h6>
                                  <p className="text-xs text-muted-foreground">{resource.provider}</p>
                                  {resource.duration && (
                                    <p className="text-xs text-muted-foreground">Длительность: {resource.duration}</p>
                                  )}
                                  {resource.salary && (
                                    <p className="text-xs text-green-600 font-medium">{resource.salary}</p>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {resource.type}
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-6 w-6 p-0 ${resource.liked ? "text-green-600" : ""}`}
                                    onClick={() => handleResourceAction(resource.id, "like")}
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-6 w-6 p-0 ${resource.disliked ? "text-red-600" : ""}`}
                                    onClick={() => handleResourceAction(resource.id, "dislike")}
                                  >
                                    <ThumbsDown className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleResourceAction(resource.id, "visit")}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Выберите этап для просмотра деталей</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
