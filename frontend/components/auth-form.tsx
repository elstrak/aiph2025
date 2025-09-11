"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    const form = event.target as HTMLFormElement
    const email = (form.querySelector('#email') as HTMLInputElement).value
    const password = (form.querySelector('#password') as HTMLInputElement).value
    const fd = new FormData()
    fd.append('username', email)
    fd.append('password', password)
    const resp = await fetch('/api/auth/login', { method: 'POST', body: fd })
    const data = await resp.json()
    setIsLoading(false)
    if (!resp.ok || !data.access_token) {
      alert(data.error || 'Ошибка входа')
      return
    }
    localStorage.setItem('access_token', data.access_token)
    window.location.href = '/dashboard'
  }

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    const form = event.target as HTMLFormElement
    const name = (form.querySelector('#name') as HTMLInputElement).value
    const email = (form.querySelector('#reg-email') as HTMLInputElement).value
    const password = (form.querySelector('#reg-password') as HTMLInputElement).value
    const resp = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, email, password }),
    })
    const data = await resp.json()
    setIsLoading(false)
    if (!resp.ok || !data.access_token) {
      alert(data.error || 'Ошибка регистрации')
      return
    }
    localStorage.setItem('access_token', data.access_token)
    window.location.href = '/dashboard'
  }

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Вход</TabsTrigger>
        <TabsTrigger value="register">Регистрация</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Вход..." : "Войти"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="register">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input id="name" type="text" placeholder="Ваше имя" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input id="reg-email" type="email" placeholder="your@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Пароль</Label>
            <Input id="reg-password" type="password" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Создание..." : "Создать аккаунт"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}
