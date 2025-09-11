"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Briefcase, Target } from "lucide-react"

export function UserProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    location: "",
    about: "",
    skills: [] as string[],
    current_position: "",
  })

  useEffect(() => {
    ;(async () => {
      try {
        const token = localStorage.getItem('access_token')
        const resp = await fetch('/api/profile/me', { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
        const data = await resp.json()
        if (resp.ok) {
          setProfile({
            full_name: data.full_name || "",
            email: data.email || "",
            location: data.location || "",
            about: data.about || "",
            skills: Array.isArray(data.skills) ? data.skills : [],
            current_position: data.current_position || "",
          })
        }
      } catch (e) {
        console.error('Failed to load profile', e)
      }
    })()
  }, [])

  // Сохраняем при выходе из режима редактирования
  useEffect(() => {
    if (!isEditing) return
    const onSave = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        const resp = await fetch('/api/profile/me', { method: 'PUT', headers, body: JSON.stringify(profile) })
        if (!resp.ok) {
          const t = await resp.text()
          console.error('Save error', t)
        }
      } catch (e) {
        console.error('Save failed', e)
      }
    }
    return () => { onSave() }
  }, [isEditing])

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
              <CardTitle className="text-xl">{profile.full_name || '—'}</CardTitle>
              <CardDescription>{profile.email || profile.location}</CardDescription>
            </div>
          </div>
          <Button variant="outline" className="ml-auto bg-transparent" onClick={() => setIsEditing((p) => !p)}>
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
                  <Label htmlFor="full_name">Полное имя</Label>
                  <Input id="full_name" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="location">Локация</Label>
                  <Input id="location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="position">Текущая должность</Label>
                  <Input id="position" value={profile.current_position} onChange={(e) => setProfile({ ...profile, current_position: e.target.value })} />
                </div>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">{profile.current_position || '—'}</p>
                <p className="text-muted-foreground">{profile.location}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              О себе
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="about">О себе</Label>
                  <Textarea id="about" value={profile.about} onChange={(e) => setProfile({ ...profile, about: e.target.value })} />
                </div>
              </>
            ) : (
              <>
                <p>{profile.about}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Навыки</CardTitle>
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
        </CardContent>
      </Card>
    </div>
  )
}
