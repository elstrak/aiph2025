"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Briefcase, Target, DollarSign } from "lucide-react"

export function UserProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Анна Иванова",
    email: "anna@example.com",
    currentPosition: "Frontend Developer",
    experience: "3 года",
    interests: ["React", "TypeScript", "UI/UX"],
    goals: "Стать Senior Frontend Developer",
    expectedSalary: "150,000 ₽",
    skills: ["JavaScript", "React", "CSS", "Git"],
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/professional-woman-avatar.png" />
              <AvatarFallback>АИ</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{profile.name}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
            </div>
          </div>
          <Button variant="outline" className="ml-auto bg-transparent" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Сохранить" : "Редактировать"}
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Текущая позиция
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="position">Должность</Label>
                  <Input
                    id="position"
                    value={profile.currentPosition}
                    onChange={(e) => setProfile({ ...profile, currentPosition: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Опыт работы</Label>
                  <Input
                    id="experience"
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">{profile.currentPosition}</p>
                <p className="text-muted-foreground">Опыт: {profile.experience}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Цели и ожидания
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="goals">Карьерные цели</Label>
                  <Textarea
                    id="goals"
                    value={profile.goals}
                    onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Ожидаемая зарплата</Label>
                  <Input
                    id="salary"
                    value={profile.expectedSalary}
                    onChange={(e) => setProfile({ ...profile, expectedSalary: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <p>{profile.goals}</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>{profile.expectedSalary}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Навыки и интересы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Текущие навыки</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Интересы</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.interests.map((interest, index) => (
                <Badge key={index} variant="outline">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
