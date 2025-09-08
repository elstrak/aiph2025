"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Briefcase,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Star,
} from "lucide-react"

interface SkillGap {
  skill: string
  required: number
  current: number
  gap: number
  priority: "high" | "medium" | "low"
  courses: CourseRecommendation[]
}

interface CourseRecommendation {
  id: string
  title: string
  provider: string
  duration: string
  price: string
  rating: number
  matchScore: number
  skillsCovered: string[]
}

interface JobMatch {
  jobId: string
  jobTitle: string
  company: string
  overallMatch: number
  skillsMatch: number
  experienceMatch: number
  salaryMatch: number
  gaps: SkillGap[]
  strengths: string[]
  recommendations: string[]
}

interface AnalysisResult {
  profileCompleteness: number
  topMatches: JobMatch[]
  criticalGaps: SkillGap[]
  recommendedCourses: CourseRecommendation[]
  careerTrajectoryScore: number
}

export function MatchingGapAnalysis() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null)

  // Mock analysis data
  useEffect(() => {
    const mockAnalysis: AnalysisResult = {
      profileCompleteness: 78,
      topMatches: [
        {
          jobId: "1",
          jobTitle: "Senior Frontend Developer",
          company: "Яндекс",
          overallMatch: 92,
          skillsMatch: 88,
          experienceMatch: 95,
          salaryMatch: 90,
          gaps: [
            {
              skill: "System Design",
              required: 8,
              current: 4,
              gap: 4,
              priority: "high",
              courses: [
                {
                  id: "1",
                  title: "System Design for Frontend",
                  provider: "Frontend Masters",
                  duration: "35 часов",
                  price: "12,000 ₽",
                  rating: 4.9,
                  matchScore: 95,
                  skillsCovered: ["System Design", "Architecture", "Scalability"],
                },
              ],
            },
            {
              skill: "Performance Optimization",
              required: 7,
              current: 5,
              gap: 2,
              priority: "medium",
              courses: [
                {
                  id: "2",
                  title: "Web Performance Optimization",
                  provider: "Google Developers",
                  duration: "20 часов",
                  price: "Бесплатно",
                  rating: 4.7,
                  matchScore: 88,
                  skillsCovered: ["Performance", "Optimization", "Core Web Vitals"],
                },
              ],
            },
          ],
          strengths: ["React", "TypeScript", "Team Leadership"],
          recommendations: [
            "Изучить системный дизайн для повышения архитектурных навыков",
            "Получить опыт оптимизации производительности",
            "Развить навыки менторинга команды",
          ],
        },
        {
          jobId: "2",
          jobTitle: "Frontend Team Lead",
          company: "Сбер",
          overallMatch: 78,
          skillsMatch: 75,
          experienceMatch: 85,
          salaryMatch: 75,
          gaps: [
            {
              skill: "Team Management",
              required: 9,
              current: 3,
              gap: 6,
              priority: "high",
              courses: [
                {
                  id: "3",
                  title: "Technical Leadership",
                  provider: "Coursera",
                  duration: "40 часов",
                  price: "8,000 ₽",
                  rating: 4.6,
                  matchScore: 92,
                  skillsCovered: ["Leadership", "Team Management", "Communication"],
                },
              ],
            },
            {
              skill: "Strategic Planning",
              required: 8,
              current: 2,
              gap: 6,
              priority: "high",
              courses: [
                {
                  id: "4",
                  title: "Product Strategy for Engineers",
                  provider: "Product School",
                  duration: "30 часов",
                  price: "15,000 ₽",
                  rating: 4.8,
                  matchScore: 85,
                  skillsCovered: ["Strategy", "Product Management", "Planning"],
                },
              ],
            },
          ],
          strengths: ["Technical Skills", "Problem Solving"],
          recommendations: [
            "Развить навыки управления командой",
            "Изучить стратегическое планирование",
            "Получить опыт в продуктовом мышлении",
          ],
        },
      ],
      criticalGaps: [
        {
          skill: "System Design",
          required: 8,
          current: 4,
          gap: 4,
          priority: "high",
          courses: [
            {
              id: "1",
              title: "System Design for Frontend",
              provider: "Frontend Masters",
              duration: "35 часов",
              price: "12,000 ₽",
              rating: 4.9,
              matchScore: 95,
              skillsCovered: ["System Design", "Architecture", "Scalability"],
            },
          ],
        },
        {
          skill: "Team Management",
          required: 9,
          current: 3,
          gap: 6,
          priority: "high",
          courses: [
            {
              id: "3",
              title: "Technical Leadership",
              provider: "Coursera",
              duration: "40 часов",
              price: "8,000 ₽",
              rating: 4.6,
              matchScore: 92,
              skillsCovered: ["Leadership", "Team Management", "Communication"],
            },
          ],
        },
      ],
      recommendedCourses: [
        {
          id: "1",
          title: "System Design for Frontend",
          provider: "Frontend Masters",
          duration: "35 часов",
          price: "12,000 ₽",
          rating: 4.9,
          matchScore: 95,
          skillsCovered: ["System Design", "Architecture", "Scalability"],
        },
        {
          id: "3",
          title: "Technical Leadership",
          provider: "Coursera",
          duration: "40 часов",
          price: "8,000 ₽",
          rating: 4.6,
          matchScore: 92,
          skillsCovered: ["Leadership", "Team Management", "Communication"],
        },
        {
          id: "2",
          title: "Web Performance Optimization",
          provider: "Google Developers",
          duration: "20 часов",
          price: "Бесплатно",
          rating: 4.7,
          matchScore: 88,
          skillsCovered: ["Performance", "Optimization", "Core Web Vitals"],
        },
      ],
      careerTrajectoryScore: 85,
    }

    setAnalysisResult(mockAnalysis)
  }, [])

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false)
      console.log("Analysis completed")
    }, 3000)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50"
      case "medium":
        return "text-yellow-600 bg-yellow-50"
      case "low":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Высокий"
      case "medium":
        return "Средний"
      case "low":
        return "Низкий"
      default:
        return "Неизвестно"
    }
  }

  if (!analysisResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Анализ соответствия и пробелов</CardTitle>
          <CardDescription>Запустите анализ для получения персональных рекомендаций</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? "Анализируем..." : "Запустить анализ"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analysis Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Анализ соответствия и пробелов
              </CardTitle>
              <CardDescription>Персональные рекомендации на основе вашего профиля</CardDescription>
            </div>
            <Button onClick={runAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? "Обновляем..." : "Обновить анализ"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Полнота профиля</span>
                <span className="text-sm text-muted-foreground">{analysisResult.profileCompleteness}%</span>
              </div>
              <Progress value={analysisResult.profileCompleteness} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Карьерная готовность</span>
                <span className="text-sm text-muted-foreground">{analysisResult.careerTrajectoryScore}%</span>
              </div>
              <Progress value={analysisResult.careerTrajectoryScore} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Критические пробелы</span>
                <span className="text-sm text-muted-foreground">{analysisResult.criticalGaps.length}</span>
              </div>
              <div className="flex gap-1">
                {analysisResult.criticalGaps.map((gap, index) => (
                  <div key={index} className="h-2 bg-red-200 rounded flex-1" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matches">Соответствие вакансиям</TabsTrigger>
          <TabsTrigger value="gaps">Пробелы в навыках</TabsTrigger>
          <TabsTrigger value="courses">Рекомендуемые курсы</TabsTrigger>
          <TabsTrigger value="trajectory">Траектория развития</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="mt-6">
          <div className="grid gap-4">
            {analysisResult.topMatches.map((match) => (
              <Card
                key={match.jobId}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedJob(match)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{match.jobTitle}</CardTitle>
                      <CardDescription>{match.company}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {match.overallMatch}% соответствие
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Навыки</span>
                        <span className="text-sm text-muted-foreground">{match.skillsMatch}%</span>
                      </div>
                      <Progress value={match.skillsMatch} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Опыт</span>
                        <span className="text-sm text-muted-foreground">{match.experienceMatch}%</span>
                      </div>
                      <Progress value={match.experienceMatch} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Зарплата</span>
                        <span className="text-sm text-muted-foreground">{match.salaryMatch}%</span>
                      </div>
                      <Progress value={match.salaryMatch} className="h-2" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium">Сильные стороны:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {match.strengths.map((strength, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <CheckCircle className="h-2 w-2 mr-1" />
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium">Основные пробелы:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {match.gaps.slice(0, 3).map((gap, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            <AlertCircle className="h-2 w-2 mr-1" />
                            {gap.skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gaps" className="mt-6">
          <div className="grid gap-4">
            {analysisResult.criticalGaps.map((gap, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{gap.skill}</CardTitle>
                    <Badge className={getPriorityColor(gap.priority)}>{getPriorityText(gap.priority)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-muted-foreground">{gap.current}</div>
                        <div className="text-sm text-muted-foreground">Текущий уровень</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{gap.required}</div>
                        <div className="text-sm text-muted-foreground">Требуемый уровень</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Прогресс до цели</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((gap.current / gap.required) * 100)}%
                        </span>
                      </div>
                      <Progress value={(gap.current / gap.required) * 100} className="h-2" />
                    </div>

                    <div>
                      <span className="text-sm font-medium mb-2 block">Рекомендуемые курсы:</span>
                      <div className="space-y-2">
                        {gap.courses.map((course) => (
                          <div key={course.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <div className="font-medium text-sm">{course.title}</div>
                              <div className="text-xs text-muted-foreground">{course.provider}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {course.matchScore}% соответствие
                              </Badge>
                              <Button size="sm" variant="outline">
                                Изучить
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <div className="grid gap-4">
            {analysisResult.recommendedCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>{course.provider}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {course.matchScore}% соответствие
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Длительность: {course.duration}</span>
                      <span>Цена: {course.price}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        <span>{course.rating}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium">Изучаемые навыки:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {course.skillsCovered.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Подробнее
                      </Button>
                      <Button size="sm">
                        <Briefcase className="h-3 w-3 mr-1" />
                        Добавить в план
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trajectory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Рекомендуемая траектория развития
              </CardTitle>
              <CardDescription>Оптимальный план для достижения ваших карьерных целей</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Краткосрочные цели (3-6 месяцев)</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Изучить System Design для Frontend (35 часов)</li>
                    <li>• Пройти курс по Web Performance Optimization (20 часов)</li>
                    <li>• Получить практический опыт в архитектурных решениях</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Среднесрочные цели (6-12 месяцев)</h4>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>• Развить навыки технического лидерства (40 часов)</li>
                    <li>• Изучить стратегическое планирование (30 часов)</li>
                    <li>• Подать заявки на Senior/Lead позиции</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Долгосрочные цели (1-2 года)</h4>
                  <ul className="space-y-1 text-sm text-purple-800">
                    <li>• Получить позицию Team Lead или Senior Developer</li>
                    <li>• Развить экспертизу в выбранной области</li>
                    <li>• Стать ментором для junior разработчиков</li>
                  </ul>
                </div>

                <Button className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Создать персональную траекторию
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
