"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  ExternalLink,
  BookOpen,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Building,
  Target,
} from "lucide-react"

// Real trajectory data interfaces
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
  items: any[]
  notes: string
}

interface TrajectoryData {
  session_id: string
  current_positions: Position[]
  future_positions: Position[]
  groups: LearningGroup[]
}

// Legacy interface for backward compatibility
interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  experience: string
  description: string
  skills: string[]
  professionalArea: string
  specialization: string
  role: string
  functions: string[]
  hardSkills: string[]
  softSkills: string[]
  tools: string[]
  techStack: string[]
  matchScore: number
  postedDate: Date
  url: string
}

interface Course {
  id: string
  title: string
  provider: string
  description: string
  duration: string
  price: string
  rating: number
  level: string
  skills: string[]
  category: string
  format: string
  language: string
  matchScore: number
  url: string
}

export function JobCourseManager() {
  const [activeTab, setActiveTab] = useState("jobs")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedTrajectory, setSelectedTrajectory] = useState<string>("all")
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryData | null>(null)
  const [filters, setFilters] = useState({
    location: "all",
    experience: "all",
    salary: "",
    skills: [] as string[],
    category: "all",
    level: "all",
  })

  // Load trajectory data from localStorage
  useEffect(() => {
    const loadTrajectoryData = () => {
      try {
        const savedData = localStorage.getItem('career_trajectory_data')
        if (savedData) {
          const data: TrajectoryData = JSON.parse(savedData)
          setTrajectoryData(data)
          
          // Convert positions to jobs format
          const allPositions = [...data.current_positions, ...data.future_positions]
          const convertedJobs: Job[] = allPositions.map((pos, index) => ({
            id: pos.idx.toString(),
            title: pos.title,
            company: pos.company,
            location: pos.location || "Удаленно",
            salary: pos.salary,
            experience: pos.experience,
            description: pos.description,
            skills: [], // Could be extracted from description
            professionalArea: "Анализ данных",
            specialization: "Data Science",
            role: pos.title.includes("Senior") ? "Senior" : "Middle",
            functions: [],
            hardSkills: [],
            softSkills: [],
            tools: [],
            techStack: [],
            matchScore: data.current_positions.includes(pos) ? 85 : 70, // Higher score for current positions
            postedDate: new Date(),
            url: "#"
          }))
          
          setJobs(convertedJobs)
          
          // Convert learning groups to courses (simplified for now)
          const convertedCourses: Course[] = data.groups.flatMap((group, groupIndex) => 
            Array.from({ length: Math.min(group.items?.length || 3, 3) }, (_, itemIndex) => ({
              id: `${group.group_id}-${itemIndex}`,
              title: `${group.title} - Курс ${itemIndex + 1}`,
              provider: "Рекомендованный провайдер",
              description: group.notes,
              duration: `${group.estimated_months} месяцев`,
              price: "Бесплатно",
              rating: 4.5,
              level: "Средний",
              skills: [],
              category: "Анализ данных",
              format: "Online",
              language: "Русский",
              matchScore: 80,
              url: "#"
            }))
          )
          
          setCourses(convertedCourses)
          console.log('Jobs and courses loaded from trajectory data')
        } else {
          // Fallback to mock data
          setJobs([
      {
        id: "1",
        title: "Senior Frontend Developer",
        company: "Яндекс",
        location: "Москва",
        salary: "250,000 - 350,000 ₽",
        experience: "3-5 лет",
        description: "Разработка пользовательских интерфейсов для высоконагруженных веб-приложений",
        skills: ["React", "TypeScript", "Redux", "CSS"],
        professionalArea: "Frontend Development",
        specialization: "Web Development",
        role: "Senior Developer",
        functions: ["UI Development", "Code Review", "Mentoring"],
        hardSkills: ["React", "TypeScript", "JavaScript", "HTML/CSS"],
        softSkills: ["Командная работа", "Менторинг", "Презентационные навыки"],
        tools: ["Git", "Webpack", "Jest", "Figma"],
        techStack: ["React", "TypeScript", "Node.js"],
        matchScore: 92,
        postedDate: new Date("2024-01-15"),
        url: "#",
      },
      {
        id: "2",
        title: "Frontend Team Lead",
        company: "Сбер",
        location: "Санкт-Петербург",
        salary: "300,000 - 450,000 ₽",
        experience: "5+ лет",
        description: "Руководство командой фронтенд-разработчиков, архитектурные решения",
        skills: ["React", "Vue.js", "Leadership", "Architecture"],
        professionalArea: "Frontend Development",
        specialization: "Team Leadership",
        role: "Team Lead",
        functions: ["Team Management", "Architecture Design", "Strategic Planning"],
        hardSkills: ["React", "Vue.js", "System Design", "Performance Optimization"],
        softSkills: ["Лидерство", "Стратегическое мышление", "Управление командой"],
        tools: ["Git", "Docker", "Kubernetes", "Monitoring Tools"],
        techStack: ["React", "Vue.js", "Node.js", "Docker"],
        matchScore: 78,
        postedDate: new Date("2024-01-12"),
        url: "#",
      },
      {
        id: "3",
        title: "Junior Frontend Developer",
        company: "Тинькофф",
        location: "Москва",
        salary: "120,000 - 180,000 ₽",
        experience: "1-2 года",
        description: "Разработка интерфейсов для банковских приложений",
        skills: ["JavaScript", "React", "CSS", "HTML"],
        professionalArea: "Frontend Development",
        specialization: "Web Development",
        role: "Junior Developer",
        functions: ["UI Development", "Bug Fixing", "Feature Implementation"],
        hardSkills: ["JavaScript", "React", "CSS", "HTML"],
        softSkills: ["Обучаемость", "Внимательность к деталям"],
        tools: ["Git", "VS Code", "Chrome DevTools"],
        techStack: ["React", "JavaScript", "CSS"],
        matchScore: 65,
        postedDate: new Date("2024-01-10"),
        url: "#",
      },
    ])

    setCourses([
      {
        id: "1",
        title: "Advanced React Patterns",
        provider: "Epic React",
        description: "Глубокое изучение продвинутых паттернов React для создания масштабируемых приложений",
        duration: "40 часов",
        price: "15,000 ₽",
        rating: 4.8,
        level: "Advanced",
        skills: ["React", "JavaScript", "Performance", "Architecture"],
        category: "Frontend Development",
        format: "Online",
        language: "Русский",
        matchScore: 95,
        url: "#",
      },
      {
        id: "2",
        title: "TypeScript Fundamentals",
        provider: "Microsoft Learn",
        description: "Основы TypeScript для безопасной разработки JavaScript приложений",
        duration: "25 часов",
        price: "Бесплатно",
        rating: 4.6,
        level: "Intermediate",
        skills: ["TypeScript", "JavaScript", "Type Safety"],
        category: "Programming Languages",
        format: "Online",
        language: "Английский",
        matchScore: 88,
        url: "#",
      },
      {
        id: "3",
        title: "System Design for Frontend",
        provider: "Frontend Masters",
        description: "Архитектура и системный дизайн для фронтенд-приложений",
        duration: "35 часов",
        price: "12,000 ₽",
        rating: 4.9,
        level: "Advanced",
        skills: ["Architecture", "System Design", "Performance", "Scalability"],
        category: "Architecture",
        format: "Online",
        language: "Английский",
        matchScore: 82,
        url: "#",
      },
    ])
        }
      } catch (error) {
        console.error('Error loading trajectory data:', error)
        // Keep empty arrays or load mock data as fallback
      }
    }
    
    loadTrajectoryData()
  }, [])

  const handleRefreshData = async () => {
    setIsLoading(true)
    // Simulate API call for parsing new jobs/courses
    setTimeout(() => {
      setIsLoading(false)
      console.log("Data refreshed")
    }, 2000)
  }

  const trajectories = [
    { id: "all", name: "Все траектории" },
    { id: "1", name: "Frontend Developer → Senior Frontend" },
    { id: "2", name: "Переход в Product Management" },
  ]

  const filteredJobs = jobs
    .filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesLocation = filters.location === "all" || job.location.includes(filters.location)
      const matchesExperience = filters.experience === "all" || job.experience.includes(filters.experience)

      return matchesSearch && matchesLocation && matchesExperience
    })
    .sort((a, b) => {
      // Sort by trajectory relevance if specific trajectory is selected
      if (selectedTrajectory !== "all") {
        return b.matchScore - a.matchScore
      }
      return 0
    })

  const filteredCourses = courses
    .filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = filters.category === "all" || course.category === filters.category
      const matchesLevel = filters.level === "all" || course.level === filters.level

      return matchesSearch && matchesCategory && matchesLevel
    })
    .sort((a, b) => {
      // Sort by trajectory relevance if specific trajectory is selected
      if (selectedTrajectory !== "all") {
        return b.matchScore - a.matchScore
      }
      return 0
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Банк вакансий и курсов</CardTitle>
              <CardDescription>Управление и анализ вакансий и образовательных программ</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Поиск и фильтры
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по названию, компании, навыкам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Label>Траектория</Label>
              <Select value={selectedTrajectory} onValueChange={setSelectedTrajectory}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите траекторию" />
                </SelectTrigger>
                <SelectContent>
                  {trajectories.map((trajectory) => (
                    <SelectItem key={trajectory.id} value={trajectory.id}>
                      <div className="flex items-center gap-2">
                        {trajectory.id !== "all" && <Target className="h-3 w-3" />}
                        {trajectory.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Локация</Label>
              <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все города</SelectItem>
                  <SelectItem value="Москва">Москва</SelectItem>
                  <SelectItem value="Санкт-Петербург">Санкт-Петербург</SelectItem>
                  <SelectItem value="Удаленно">Удаленно</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Опыт работы</Label>
              <Select
                value={filters.experience}
                onValueChange={(value) => setFilters({ ...filters, experience: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Опыт" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Любой опыт</SelectItem>
                  <SelectItem value="1-2">1-2 года</SelectItem>
                  <SelectItem value="3-5">3-5 лет</SelectItem>
                  <SelectItem value="5+">5+ лет</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Категория</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                  <SelectItem value="Programming Languages">Programming Languages</SelectItem>
                  <SelectItem value="Architecture">Architecture</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Уровень</Label>
              <Select value={filters.level} onValueChange={(value) => setFilters({ ...filters, level: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Уровень" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все уровни</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTrajectory !== "all" && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Показаны результаты, отсортированные по релевантности для выбранной траектории
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Вакансии ({filteredJobs.length})
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Курсы ({filteredCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-6">
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {job.salary}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedTrajectory !== "all" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {job.matchScore}% релевантность
                        </Badge>
                      )}
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Открыть
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{job.description}</p>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium">Требуемые навыки:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.hardSkills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Инструменты:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.tools.map((tool, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Опубликовано: {job.postedDate.toLocaleDateString()}
                      </span>
                      <span>Опыт: {job.experience}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <div className="grid gap-4">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {course.provider}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {course.price}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedTrajectory !== "all" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {course.matchScore}% релевантность
                        </Badge>
                      )}
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Перейти
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{course.description}</p>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium">Изучаемые навыки:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {course.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Рейтинг: {course.rating}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {course.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {course.format}
                        </Badge>
                      </div>
                      <span>Язык: {course.language}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
