import { UserProfile } from "@/components/user-profile"
import { CareerChat } from "@/components/career-chat"
import { CareerTrajectory } from "@/components/career-trajectory"
import { JobCourseManager } from "@/components/job-course-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">AI Карьерный Компаньон</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="chat">Чат с AI</TabsTrigger>
            <TabsTrigger value="trajectory">Карьерная траектория</TabsTrigger>
            <TabsTrigger value="jobs-courses">Вакансии и курсы</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <UserProfile />
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <CareerChat />
          </TabsContent>

          <TabsContent value="trajectory" className="mt-6">
            <CareerTrajectory />
          </TabsContent>

          <TabsContent value="jobs-courses" className="mt-6">
            <JobCourseManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
