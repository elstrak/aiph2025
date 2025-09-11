"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

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

interface TrajectoryPDFExportProps {
  trajectoryData: TrajectoryData | null
  userName?: string
}

export function TrajectoryPDFExport({ trajectoryData, userName = "Пользователь" }: TrajectoryPDFExportProps) {
  // Функция для сокращения описания
  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength).trim() + "..."
  }

  const generatePDF = () => {
    if (!trajectoryData) {
      alert("Нет данных траектории для экспорта")
      return
    }

    // Создаем HTML содержимое для PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Карьерная траектория - ${userName}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #3b82f6;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0 0 0;
            font-size: 16px;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section h2 {
            color: #1f2937;
            border-left: 4px solid #3b82f6;
            padding-left: 15px;
            margin-bottom: 20px;
            font-size: 22px;
          }
          .position-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
          }
          .position-title {
            font-weight: bold;
            color: #1f2937;
            font-size: 18px;
            margin-bottom: 5px;
          }
          .position-company {
            color: #3b82f6;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .position-details {
            display: flex;
            gap: 20px;
            margin-bottom: 10px;
            font-size: 14px;
            color: #6b7280;
          }
          .position-description {
            color: #4b5563;
            font-size: 14px;
            line-height: 1.5;
          }
          .group-card {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
          }
          .group-title {
            font-weight: bold;
            color: #0369a1;
            font-size: 16px;
            margin-bottom: 8px;
          }
          .group-meta {
            display: flex;
            gap: 20px;
            margin-bottom: 10px;
            font-size: 14px;
            color: #0369a1;
          }
          .group-notes {
            color: #0c4a6e;
            font-size: 14px;
            line-height: 1.5;
          }
          .current-positions {
            border-left: 4px solid #10b981;
          }
          .future-positions {
            border-left: 4px solid #f59e0b;
          }
          .learning-groups {
            border-left: 4px solid #8b5cf6;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
          .skills-section {
            margin-top: 15px;
            padding: 10px;
            background: #f8fafc;
            border-radius: 6px;
          }
          .skills-section h4 {
            margin: 0 0 10px 0;
            color: #1f2937;
            font-size: 14px;
          }
          .skills-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .skill-item {
            padding: 8px;
            background: white;
            border-radius: 4px;
            border-left: 3px solid #3b82f6;
          }
          .skill-name {
            font-weight: 600;
            color: #1f2937;
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 4px;
          }
          .priority-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
          }
          .priority-1 { background-color: #ef4444; }
          .priority-2 { background-color: #f97316; }
          .priority-3 { background-color: #eab308; }
          .priority-4 { background-color: #22c55e; }
          .skill-type {
            font-size: 11px;
            color: #6b7280;
            font-weight: normal;
          }
          .skill-rationale {
            font-size: 12px;
            color: #4b5563;
            margin: 4px 0;
          }
          .skill-prerequisites {
            font-size: 11px;
            color: #6b7280;
            margin-top: 4px;
          }
          .recommendations-section {
            margin-top: 15px;
            padding: 10px;
            background: #f0fdf4;
            border-radius: 6px;
          }
          .recommendations-section h4 {
            margin: 0 0 10px 0;
            color: #166534;
            font-size: 14px;
          }
          .recommendations-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .recommendation-item {
            padding: 8px;
            background: white;
            border-radius: 4px;
            border-left: 3px solid #22c55e;
          }
          .rec-title {
            font-weight: 600;
            color: #166534;
            font-size: 13px;
          }
          .rec-provider {
            font-size: 11px;
            color: #6b7280;
            margin: 2px 0;
          }
          .rec-outcomes, .rec-duration, .rec-cost {
            font-size: 11px;
            margin: 2px 0;
          }
          .rec-outcomes { color: #166534; }
          .rec-duration { color: #6b7280; }
          .rec-cost { color: #059669; }
          @media print {
            body { 
              margin: 0; 
              font-size: 12px;
              line-height: 1.4;
            }
            .header { 
              page-break-after: avoid; 
              margin-bottom: 20px;
            }
            .section { 
              page-break-inside: avoid; 
              margin-bottom: 25px;
            }
            .position-card, .group-card {
              page-break-inside: avoid;
              margin-bottom: 15px;
            }
            .skills-section, .recommendations-section {
              page-break-inside: avoid;
              margin-bottom: 10px;
            }
            .skill-item, .recommendation-item {
              page-break-inside: avoid;
              margin-bottom: 6px;
            }
            .footer {
              page-break-before: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Карьерная траектория</h1>
          <p>${userName} • ${new Date().toLocaleDateString('ru-RU')}</p>
        </div>

        <div class="section current-positions">
          <h2>Текущие позиции</h2>
          ${trajectoryData.current_positions.map(pos => `
            <div class="position-card">
              <div class="position-title">${pos.title}</div>
              <div class="position-company">${pos.company}</div>
              <div class="position-details">
                <span>📍 ${pos.location || 'Удаленно'}</span>
                <span>💰 ${pos.salary}</span>
                <span>⏱️ ${pos.experience}</span>
              </div>
              <div class="position-description">${truncateDescription(pos.description, 100)}</div>
            </div>
          `).join('')}
        </div>

        <div class="section future-positions">
          <h2>Целевые позиции</h2>
          ${trajectoryData.future_positions.map(pos => `
            <div class="position-card">
              <div class="position-title">${pos.title}</div>
              <div class="position-company">${pos.company}</div>
              <div class="position-details">
                <span>📍 ${pos.location || 'Удаленно'}</span>
                <span>💰 ${pos.salary}</span>
                <span>⏱️ ${pos.experience}</span>
              </div>
              <div class="position-description">${truncateDescription(pos.description, 100)}</div>
            </div>
          `).join('')}
        </div>

        <div class="section learning-groups">
          <h2>План обучения</h2>
          ${trajectoryData.groups.map(group => `
            <div class="group-card">
              <div class="group-title">${group.title}</div>
              <div class="group-meta">
                <span>⏱️ ${group.estimated_months} месяцев</span>
                <span>📅 ${group.hours_per_week} часов/неделю</span>
                <span>🎯 ${group.items?.length || 0} навыков для изучения</span>
              </div>
              <div class="group-notes">${group.notes || 'Описание курса обучения'}</div>
              
              ${group.items && group.items.length > 0 ? `
                <div class="skills-section">
                  <h4>🎯 Навыки для изучения:</h4>
                  <div class="skills-list">
                    ${group.items.map(item => `
                      <div class="skill-item">
                        <div class="skill-name">
                          <span class="priority-dot priority-${item.priority || 3}"></span>
                          ${item.name}
                          <span class="skill-type">(${item.kind === 'skill' ? 'Навык' : item.kind === 'experience' ? 'Опыт' : 'Уровень'})</span>
                        </div>
                        ${item.rationale ? `<div class="skill-rationale">${item.rationale}</div>` : ''}
                        ${item.prerequisites && item.prerequisites.length > 0 ? `
                          <div class="skill-prerequisites">
                            📋 Предварительные требования: ${item.prerequisites.join(', ')}
                          </div>
                        ` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
              
              ${group.items && group.items.some(item => item.recommendations?.length > 0) ? `
                <div class="recommendations-section">
                  <h4>🤖 AI-рекомендации:</h4>
                  <div class="recommendations-list">
                    ${group.items.flatMap(item => 
                      item.recommendations?.map(rec => `
                        <div class="recommendation-item">
                          <div class="rec-title">${rec.title || 'Рекомендация'}</div>
                          <div class="rec-provider">${rec.provider || 'AI Рекомендация'}</div>
                          ${rec.expected_outcomes ? `<div class="rec-outcomes">🎯 ${rec.expected_outcomes}</div>` : ''}
                          ${rec.duration_hours ? `<div class="rec-duration">⏱️ ${rec.duration_hours} часов</div>` : ''}
                          ${rec.cost ? `<div class="rec-cost">💰 ${rec.cost}</div>` : ''}
                        </div>
                      `) || []
                    ).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <div class="footer">
          <p>Сгенерировано Career Coach • ${new Date().toLocaleString('ru-RU')}</p>
        </div>
      </body>
      </html>
    `

    // Создаем временный элемент для печати в PDF
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Ждем загрузки и печатаем в PDF
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          // Закрываем окно после печати
          setTimeout(() => {
            printWindow.close()
          }, 1000)
        }, 500)
      }
    } else {
      // Fallback: скачиваем как HTML файл
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `career-trajectory-${userName}-${new Date().toISOString().split('T')[0]}.html`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    }
  }

  if (!trajectoryData) {
    return null
  }

  return (
    <Button
      onClick={generatePDF}
      variant="outline"
      className="w-full justify-start"
    >
      <Download className="h-4 w-4 mr-2" />
      Скачать траекторию
    </Button>
  )
}
