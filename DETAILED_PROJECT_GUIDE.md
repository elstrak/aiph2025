# AI Career Companion - Подробное руководство по проекту

## 📋 Общее описание проекта

**AI Career Companion** - это интеллектуальная система карьерного коучинга, которая помогает пользователям:

1. **Пройти интервью с AI** для сбора информации о профессиональном опыте
2. **Получить персонализированные рекомендации** по вакансиям и курсам
3. **Построить карьерную траекторию** с пошаговым планом развития
4. **Анализировать пробелы в навыках** и получать рекомендации по их закрытию

## 🏗️ Архитектура проекта

Проект состоит из двух основных частей:

### 1. **Backend (ML/API)** - FastAPI + YandexGPT + MongoDB
- Обработка чата с пользователем через YandexGPT
- Семантический поиск по вакансиям и курсам через FAISS
- Анализ профиля и построение карьерных траекторий
- Хранение данных в MongoDB

### 2. **Frontend** - Next.js + TypeScript + Tailwind CSS
- Современный веб-интерфейс для взаимодействия с пользователем
- Компоненты для чата, профиля, траекторий и поиска
- Адаптивный дизайн с темной/светлой темой

---

## 🗂️ Структура проекта

```
aiph2025/
├── ml/                          # Backend часть (Python/FastAPI)
│   ├── app/                     # Основное приложение
│   │   ├── config.py           # Конфигурация (настройки из .env)
│   │   ├── main.py             # Точка входа FastAPI приложения
│   │   ├── prompts.py          # Промпты для YandexGPT
│   │   ├── db/                 # Работа с базой данных
│   │   ├── models/             # Pydantic модели для API
│   │   ├── routers/            # API роутеры (endpoints)
│   │   ├── services/           # Бизнес-логика
│   │   ├── repos/              # Репозитории для работы с БД
│   │   └── startup/            # Инициализация данных
│   ├── data/                   # Данные (вакансии, курсы, эмбеддинги)
│   ├── docker-compose.yml     # Docker Compose для запуска
│   ├── Dockerfile             # Docker образ для API
│   └── pyproject.toml         # Python зависимости (uv)
├── frontend/                   # Frontend часть (Next.js)
│   ├── app/                   # Next.js App Router
│   ├── components/            # React компоненты
│   ├── hooks/                 # Custom React hooks
│   └── package.json           # Node.js зависимости
└── README.md                  # Основной README
```

---

# 🔧 Backend (ML/API) - Детальный разбор

## 📁 Основные файлы

### `ml/app/main.py` - Точка входа приложения
**Назначение**: Основной файл FastAPI приложения, настройка и запуск сервера

**Ключевые функции**:
- `lifespan()` - Управление жизненным циклом приложения:
  - Инициализация MongoDB подключения
  - Создание индексов в БД
  - Загрузка данных о вакансиях и курсах
  - Построение FAISS индексов для семантического поиска
  - Закрытие соединений при остановке
- `health()` - Health check endpoint для проверки состояния API

**Подключенные роутеры**:
- `/sessions` - Управление сессиями чата
- `/chat` - Интервью с AI
- `/profile` - Построение профиля пользователя
- `/match` - Поиск вакансий и курсов
- `/trajectory` - Построение карьерных траекторий

### `ml/app/config.py` - Конфигурация приложения
**Назначение**: Управление настройками через переменные окружения

**Настройки**:
```python
class Settings(BaseSettings):
    app_env: str = "development"        # Окружение приложения
    app_host: str = "0.0.0.0"          # Хост для запуска
    app_port: int = 8000               # Порт для запуска
    
    mongo_uri: str = "mongodb://mongo:27017"  # URI MongoDB
    mongo_db: str = "career_coach"            # Имя базы данных
    
    yandex_folder_id: str = ""         # Yandex Cloud Folder ID
    yandex_api_key: str = ""           # API ключ YandexGPT
    yandex_iam_token: str = ""         # IAM токен (альтернатива API ключу)
    
    message_window_size: int = 12      # Размер окна сообщений для чата
```

### `ml/app/prompts.py` - Промпты для YandexGPT
**Назначение**: Содержит все системные промпты для различных задач

**Основные промпты**:

1. **`CHAT_SYSTEM_PROMPT`** - HR аналитик для сбора информации:
   - Собирает опыт работы, навыки, образование, цели
   - Задает максимум 3 вопроса за раз
   - Не дает советов, только собирает информацию

2. **`PROFILE_SYSTEM_PROMPT`** - Построение структурированного профиля:
   - Анализирует всю историю диалога
   - Возвращает JSON с профилем пользователя

3. **`MATCH_SYSTEM_PROMPT_STAGE1/STAGE2`** - Поиск вакансий:
   - Stage 1: Отбор до 20 вакансий по названиям
   - Stage 2: Финальный отбор до 5 по полному описанию

4. **`COURSE_MATCH_SYSTEM_PROMPT_STAGE1/STAGE2`** - Поиск курсов:
   - Аналогично вакансиям, но для образовательных курсов

5. **`GAP_ANALYSIS_SYSTEM_PROMPT`** - Анализ пробелов в навыках:
   - Определяет разрывы между текущим и целевым состоянием

## 📁 Модели данных (`ml/app/models/`)

### `schemas.py` - Основные схемы
**Основные модели**:

```python
class Message(BaseModel):           # Сообщение в чате
    message_id: str                 # Уникальный ID
    session_id: str                 # ID сессии
    role: MessageRole              # user/assistant/system
    content: str                   # Текст сообщения
    created_at: str               # Время создания
    tokens: Optional[int]         # Количество токенов
    done: Optional[bool]          # Завершено ли интервью

class UserProfile(BaseModel):       # Профиль пользователя
    achievements: List[str]         # Достижения
    professional_context: ProfessionalContext  # Контекст профессии
    resume: List[ResumeItem]        # Опыт работы
    skills: Skills                  # Навыки
    goals: Goals                   # Карьерные цели
    preferences: Preferences       # Предпочтения (формат работы, локация)
```

### `match_models.py` - Модели для поиска
```python
class MatchVacanciesRequest(BaseModel):  # Запрос поиска вакансий
    resume: str                         # Резюме в текстовом виде
    k_faiss: int = 100                 # Количество для FAISS поиска
    k_stage1: int = 20                 # Количество для 1-го этапа
    k_stage2: int = 5                  # Финальное количество

class MatchedVacancy(BaseModel):        # Найденная вакансия
    idx: int                           # Индекс в базе
    title: str                         # Название позиции
    company: str                       # Компания
    location: str                      # Локация
    salary: str                        # Зарплата
    experience: str                    # Требуемый опыт
    description: str                   # Описание вакансии
```

### `trajectory_models.py` - Модели траекторий
```python
class GapItem(BaseModel):              # Пробел в навыках
    name: str                          # Название навыка
    kind: Literal["skill", "experience", "level"]  # Тип пробела
    priority: int                      # Приоритет (1=высокий)
    prerequisites: List[str]           # Зависимости
    recommendations: List[RecommendationItem]  # Рекомендации

class TrajectoryResponse(BaseModel):    # Ответ с траекторией
    session_id: str                    # ID сессии
    current_positions: List[MatchedVacancy]   # Доступные сейчас вакансии
    groups: List[GapGroup]             # Группы навыков для изучения
    future_positions: List[MatchedVacancy]    # Целевые вакансии
```

## 📁 Сервисы (`ml/app/services/`)

### `chat_service.py` - Сервис чата
**Назначение**: Обработка диалога с пользователем через YandexGPT

**Ключевые методы**:
```python
class ChatService:
    def build_messages_payload(self, chat_messages: List[dict]) -> List[dict]:
        """Формирует payload для YandexGPT с системным промптом"""
        
    def get_response_schema(self) -> dict:
        """Возвращает JSON схему для структурированного ответа"""
        
    def parse_model_output(self, raw: str) -> Tuple[str, bool]:
        """Парсит ответ модели и извлекает текст + флаг завершения"""
        
    async def generate_reply(self, session_id: str, text: str, ...) -> ChatResponse:
        """Основной метод: генерирует ответ AI на сообщение пользователя"""
        # 1. Сохраняет сообщение пользователя в БД
        # 2. Загружает последние 40 сообщений из истории
        # 3. Отправляет запрос к YandexGPT
        # 4. Парсит ответ и сохраняет в БД
        # 5. Возвращает ответ пользователю
```

### `match_service.py` - Сервис поиска
**Назначение**: Семантический поиск вакансий и курсов

**Архитектура поиска (3-этапная)**:
1. **FAISS поиск** - Находит ~100 наиболее похожих по эмбеддингам
2. **Stage 1 (LLM)** - Отбирает ~20 лучших по названиям
3. **Stage 2 (LLM)** - Финальный отбор ~5 по полному описанию

**Ключевые методы**:
```python
class MatchService:
    def preprocess_resume(self, resume: str) -> str:
        """Обогащает резюме ключевыми словами через LLM"""
        
    def embed_query(self, text: str) -> Any:
        """Создает эмбеддинг текста через YandexGPT"""
        
    async def match_vacancies(self, request: MatchVacanciesRequest, repo: VacanciesRepository) -> MatchVacanciesResponse:
        """Основной метод поиска вакансий"""
        # 1. Препроцессинг резюме (добавление ключевых слов)
        # 2. Создание эмбеддинга запроса
        # 3. FAISS поиск топ-100 вакансий
        # 4. LLM отбор топ-20 по названиям
        # 5. LLM финальный отбор топ-5 по описаниям
        
    async def match_courses(self, request: MatchCoursesRequest, repo: CoursesRepository) -> MatchCoursesResponse:
        """Аналогичный поиск для курсов"""
        
    async def match_future(self, request: MatchFutureRequest, repo: VacanciesRepository) -> MatchVacanciesResponse:
        """Поиск вакансий для будущих целей (на основе пожеланий)"""
```

### `profile_service.py` - Сервис профилей
**Назначение**: Построение структурированного профиля из истории чата

```python
class ProfileService:
    def get_profile_schema(self) -> dict:
        """Возвращает детальную JSON схему для профиля пользователя"""
        # Включает все поля: опыт, навыки, цели, предпочтения
        
    async def build_profile(self, session_id: str, sessions_repo: SessionsRepository, messages_repo: MessagesRepository) -> dict:
        """Основной метод построения профиля"""
        # 1. Проверяет завершенность интервью (done=True)
        # 2. Загружает всю историю сообщений
        # 3. Отправляет к YandexGPT с промптом профилирования
        # 4. Парсит структурированный JSON ответ
        # 5. Возвращает готовый профиль
```

### `trajectory_service.py` - Сервис траекторий
**Назначение**: Построение персональных карьерных планов

```python
class TrajectoryService:
    async def build(self, req: TrajectoryBuildRequest, ...) -> TrajectoryResponse:
        """Основной метод построения траектории"""
        # 1. Построение профиля пользователя
        # 2. Поиск текущих доступных вакансий (на основе опыта)
        # 3. Поиск целевых вакансий (на основе целей)
        # 4. Анализ пробелов между текущим и желаемым состоянием
        # 5. Поиск курсов для закрытия пробелов
        # 6. Генерация практических рекомендаций
        # 7. Планирование по времени с учетом ограничений
        # 8. Сохранение результата в БД
        
    def _resume_text_from_full_profile(self, profile: UserProfile) -> str:
        """Преобразует профиль в текст резюме для поиска"""
```

### `yandex_sdk.py` - Интеграция с YandexGPT
**Назначение**: Обертка для работы с Yandex Cloud ML SDK

```python
def run_structured_completion(messages: List[Dict[str, str]], json_schema: Dict[str, Any], ...) -> str:
    """Запрос к YandexGPT с структурированным выводом (JSON)"""
    
def run_text_completion(messages: List[Dict[str, str]], ...) -> str:
    """Обычный текстовый запрос к YandexGPT"""
    
def embed_text(text: str, model_kind: str = "query") -> np.ndarray:
    """Создание эмбеддинга текста для семантического поиска"""
```

## 📁 Роутеры (`ml/app/routers/`)

### `chat.py` - API для чата
```python
@router.post("/{session_id}", response_model=ChatResponse)
async def chat(session_id: str, req: ChatRequest, ...) -> ChatResponse:
    """POST /chat/{session_id} - отправка сообщения в чат"""
```

### `profile.py` - API для профилей
```python
@router.get("/{session_id}", response_model=ProfileResponse)
async def get_profile(session_id: str, ...) -> ProfileResponse:
    """GET /profile/{session_id} - получение профиля пользователя"""
```

### `match.py` - API для поиска
```python
@router.post("/top", response_model=MatchVacanciesResponse)
async def match_resume(req: MatchVacanciesRequest, ...) -> MatchVacanciesResponse:
    """POST /match/top - поиск вакансий по резюме"""

@router.post("/courses", response_model=MatchCoursesResponse)
async def match_courses(req: MatchCoursesRequest, ...) -> MatchCoursesResponse:
    """POST /match/courses - поиск курсов по навыкам"""

@router.post("/future", response_model=MatchVacanciesResponse)
async def match_future(req: MatchFutureRequest, ...) -> MatchVacanciesResponse:
    """POST /match/future - поиск вакансий для будущих целей"""
```

### `trajectory.py` - API для траекторий
```python
@router.post("/build", response_model=TrajectoryResponse)
async def build_trajectory(req: TrajectoryBuildRequest, ...) -> TrajectoryResponse:
    """POST /trajectory/build - построение карьерной траектории"""
```

## 📁 Репозитории (`ml/app/repos/`)

### `chat_repos.py` - Работа с чатом
```python
class SessionsRepository:
    async def find_by_id(self, session_id: str) -> Optional[dict]:
        """Поиск сессии по ID"""

class MessagesRepository:
    async def list_by_session(self, session_id: str, limit: int = 40) -> List[dict]:
        """Получение сообщений сессии"""
    
    async def insert_one(self, message: dict) -> None:
        """Сохранение сообщения"""
    
    async def find_last_assistant_message(self, session_id: str) -> Optional[dict]:
        """Поиск последнего сообщения ассистента"""
```

### `match_repos.py` - Работа с вакансиями/курсами
```python
class VacanciesRepository:
    async def find_by_idx(self, indices: Iterable[int]) -> List[dict]:
        """Получение вакансий по индексам"""

class CoursesRepository:
    async def find_by_idx(self, indices: Iterable[int]) -> List[dict]:
        """Получение курсов по индексам"""
```

## 📁 Инициализация данных (`ml/app/startup/`)

### `seed_vacancies.py` - Загрузка вакансий
```python
async def seed_vacancies_if_needed() -> None:
    """Загружает вакансии из data/vacancies.parquet в MongoDB"""
    # 1. Читает Parquet файл через Polars
    # 2. Нормализует схему данных
    # 3. Проверяет существующие записи
    # 4. Вставляет только новые вакансии
```

### `seed_courses.py` - Загрузка курсов
```python
async def seed_courses_if_needed() -> None:
    """Аналогично загружает курсы из data/courses.parquet"""
```

### `load_embeddings.py` - FAISS индексы
```python
def build_faiss() -> None:
    """Строит FAISS индексы для семантического поиска"""
    # 1. Загружает эмбеддинги из .npy файлов
    # 2. Нормализует векторы
    # 3. Создает HNSW индексы для быстрого поиска
    # 4. Отдельные индексы для вакансий и курсов

def search_top_k(query_vec: np.ndarray, k: int = 100) -> np.ndarray:
    """Поиск топ-k похожих вакансий"""

def search_top_k_courses(query_vec: np.ndarray, k: int = 100) -> np.ndarray:
    """Поиск топ-k похожих курсов"""
```

## 📁 База данных (`ml/app/db/`)

### `mongo.py` - MongoDB подключение
```python
async def init_mongo(settings: Settings) -> None:
    """Инициализация подключения к MongoDB"""

async def get_db() -> AsyncIOMotorDatabase:
    """Получение экземпляра базы данных"""

async def ensure_indexes() -> None:
    """Создание индексов для оптимизации запросов"""
    # sessions: индекс по user_id
    # profiles: индекс по user_id  
    # messages: составной индекс по (session_id, created_at)

def sanitize_mongo_doc(doc: dict) -> dict:
    """Удаление _id поля из MongoDB документов"""
```

---

# 🎨 Frontend - Детальный разбор

## 📁 Структура приложения (`frontend/app/`)

### `layout.tsx` - Корневой layout
**Назначение**: Основная разметка приложения
- Подключение шрифтов Geist (Sans/Mono)
- Интеграция Vercel Analytics
- Настройка метаданных

### `page.tsx` - Главная страница
**Назначение**: Страница входа в систему
- Компонент `AuthForm` для авторизации
- Приветственное сообщение
- Карточка с формой входа

### `dashboard/page.tsx` - Основной дашборд
**Назначение**: Главная рабочая область с вкладками
```typescript
export default function DashboardPage() {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">Профиль</TabsTrigger>
        <TabsTrigger value="chat">Чат с AI</TabsTrigger>
        <TabsTrigger value="trajectory">Карьерная траектория</TabsTrigger>
        <TabsTrigger value="jobs-courses">Вакансии и курсы</TabsTrigger>
      </TabsList>
      {/* Содержимое вкладок */}
    </Tabs>
  )
}
```

## 📁 Компоненты (`frontend/components/`)

### `auth-form.tsx` - Форма авторизации
**Назначение**: Компонент для входа/регистрации
- Переключение между режимами входа и регистрации
- Валидация формы
- Интеграция с API аутентификации

### `career-chat.tsx` - Чат с AI
**Назначение**: Интерфейс для интервью с AI консультантом

**Основной функционал**:
```typescript
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function CareerChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [trajectoryMode, setTrajectoryMode] = useState<"new" | "edit" | "">("")
  
  const handleSendMessage = async () => {
    // 1. Добавляет сообщение пользователя
    // 2. Отправляет запрос к API /chat/{session_id}
    // 3. Получает ответ AI и добавляет в историю
  }
}
```

**Возможности**:
- Загрузка резюме в PDF/DOC формате
- Создание новых или редактирование существующих траекторий
- Сохранение информации в профиль
- Быстрые действия (анализ рынка, рекомендации курсов)

### `career-trajectory.tsx` - Карьерные траектории
**Назначение**: Визуализация и управление карьерным планом

**Структуры данных**:
```typescript
interface TrajectoryStep {
  id: string
  title: string                    // "Изучение TypeScript"
  description: string              // Подробное описание
  type: "skill" | "course" | "job" | "milestone"
  status: "completed" | "current" | "upcoming"
  startDate: Date
  endDate: Date
  resources: Resource[]            // Курсы, вакансии, статьи
  requirements?: string[]          // Предварительные требования
}

interface Resource {
  id: string
  title: string                    // "TypeScript Fundamentals"
  type: "course" | "job" | "article" | "certification"
  provider: string                 // "TypeScript Lang"
  url: string
  rating: number
  duration?: string                // "25 часов"
  salary?: string                  // Для вакансий
  liked?: boolean                  // Пользовательские оценки
  disliked?: boolean
}
```

**Функционал**:
- Timeline с этапами развития
- Прогресс выполнения траектории
- Детали каждого этапа с ресурсами
- Управление траекторией (запуск/пауза)
- Оценка ресурсов (лайки/дизлайки)
- Переходы к поиску вакансий/курсов

### `user-profile.tsx` - Профиль пользователя
**Назначение**: Отображение и редактирование профиля
- Персональная информация
- Опыт работы
- Навыки и компетенции
- Карьерные цели
- Предпочтения по работе

### `job-course-manager.tsx` - Поиск вакансий и курсов
**Назначение**: Интерфейс для поиска и управления рекомендациями
- Фильтры по типу, локации, зарплате
- Результаты поиска с рейтингами
- Сохранение в избранное
- Интеграция с траекториями

### `matching-gap-analysis.tsx` - Анализ пробелов
**Назначение**: Визуализация анализа навыков
- Сравнение текущих и требуемых навыков
- Приоритизация пробелов
- Рекомендации по развитию

## 📁 UI компоненты (`frontend/components/ui/`)

Проект использует **shadcn/ui** - современную библиотеку компонентов на основе Radix UI и Tailwind CSS.

**Основные компоненты**:
- `button.tsx` - Кнопки различных стилей
- `card.tsx` - Карточки для группировки контента
- `input.tsx`, `textarea.tsx` - Поля ввода
- `select.tsx` - Выпадающие списки
- `tabs.tsx` - Вкладки
- `dialog.tsx` - Модальные окна
- `badge.tsx` - Значки и теги
- `progress.tsx` - Индикаторы прогресса
- `scroll-area.tsx` - Прокручиваемые области

---

# 🚀 Запуск проекта

## Предварительные требования

1. **Docker & Docker Compose** - для запуска MongoDB и API
2. **Node.js 18+** - для frontend
3. **Python 3.12+** с **uv** - для backend (альтернативно Docker)
4. **YandexGPT API ключи** - для работы с AI

## Настройка Backend

1. **Создание .env файла**:
```bash
cd ml
cp .env.example .env
```

2. **Заполнение .env**:
```env
# Yandex Cloud настройки (обязательно!)
YANDEX_FOLDER_ID=your_folder_id_here
YANDEX_API_KEY=your_api_key_here
# или
YANDEX_IAM_TOKEN=your_iam_token_here

# MongoDB (по умолчанию подходит для Docker)
MONGO_URI=mongodb://localhost:27017
MONGO_DB=career_coach

# Приложение
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8000
```

3. **Запуск через Docker Compose**:
```bash
cd ml
docker compose up --build
```

API будет доступен по адресу: `http://localhost:8044`

4. **Альтернативный запуск (без Docker)**:
```bash
cd ml
uv sync                    # Установка зависимостей
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Настройка Frontend

1. **Установка зависимостей**:
```bash
cd frontend
npm install
# или
pnpm install
```

2. **Запуск development сервера**:
```bash
npm run dev
# или
pnpm dev
```

Frontend будет доступен по адресу: `http://localhost:3000`

## Проверка работоспособности

1. **Health check API**: `GET http://localhost:8044/health`
2. **Swagger документация**: `http://localhost:8044/docs`
3. **Frontend**: `http://localhost:3000`

---

# 🔄 Основные пользовательские сценарии

## 1. Создание профиля через интервью

1. Пользователь заходит на сайт и проходит авторизацию
2. Переходит во вкладку "Чат с AI"
3. Нажимает "Создать новую траекторию"
4. AI задает вопросы о:
   - Текущем опыте работы
   - Навыках и компетенциях
   - Карьерных целях и амбициях
   - Предпочтениях по работе
5. После завершения интервью (done=True) профиль автоматически строится

**API вызовы**:
```
POST /sessions -> создание сессии
POST /chat/{session_id} -> диалог с AI (несколько раз)
GET /profile/{session_id} -> получение готового профиля
```

## 2. Поиск подходящих вакансий

1. На основе построенного профиля система автоматически ищет вакансии
2. Пользователь может также вручную запросить поиск во вкладке "Вакансии и курсы"
3. Система выполняет 3-этапный поиск:
   - FAISS находит 100 семантически похожих вакансий
   - LLM отбирает 20 лучших по названиям
   - LLM делает финальный отбор 5 вакансий

**API вызовы**:
```
POST /match/top 
{
  "resume": "текст резюме",
  "k_faiss": 100,
  "k_stage1": 20, 
  "k_stage2": 5
}
```

## 3. Построение карьерной траектории

1. Во вкладке "Карьерная траектория" пользователь нажимает "Построить план"
2. Система анализирует:
   - Текущие навыки vs требования целевых позиций
   - Пробелы в знаниях и опыте
   - Временные ограничения пользователя
3. Строит пошаговый план с группировкой по времени
4. Для каждого этапа подбирает курсы, проекты и практические советы

**API вызовы**:
```
POST /trajectory/build
{
  "session_id": "...",
  "weekly_hours": 10,
  "total_months": 12,
  "target_positions_limit": 5,
  "current_positions_limit": 5
}
```

## 4. Поиск курсов для развития

1. Пользователь может искать курсы по конкретным навыкам
2. Система использует тот же 3-этапный поиск, что и для вакансий
3. Результаты показываются с рейтингами и подробной информацией

**API вызовы**:
```
POST /match/courses
{
  "desired_skills": "TypeScript, React, архитектура приложений",
  "field": "Frontend разработка",
  "specialization": "React разработчик"
}
```

---

# 🛠️ Технические детали

## Семантический поиск (FAISS)

Система использует **FAISS** (Facebook AI Similarity Search) для быстрого поиска похожих вакансий и курсов:

1. **Предварительная подготовка**:
   - Все вакансии и курсы превращены в эмбеддинги через YandexGPT
   - Эмбеддинги сохранены в .npy файлах по группам (по 100 штук)
   - При запуске строятся HNSW индексы для быстрого поиска

2. **Процесс поиска**:
   - Пользовательский запрос превращается в эмбеддинг
   - FAISS находит топ-100 наиболее похожих векторов
   - LLM дополнительно фильтрует результаты по смыслу

## Архитектура LLM промптов

Система использует **структурированные промпты** с JSON схемами:

1. **Чат-интервью**: Собирает информацию пошагово, не давая советов
2. **Профилирование**: Анализирует всю историю и строит структурированный JSON
3. **Поиск**: Двухэтапная фильтрация (по названиям → по описаниям)
4. **Анализ пробелов**: Сравнивает навыки и находит точки роста

## База данных (MongoDB)

**Коллекции**:
- `sessions` - Сессии чата пользователей
- `messages` - История сообщений
- `profiles` - Профили пользователей  
- `vacancies` - База вакансий (из Parquet файла)
- `courses` - База курсов (из Parquet файла)
- `trajectories` - Сохраненные карьерные планы

**Индексы для производительности**:
- `sessions.user_id` - Быстрый поиск по пользователю
- `messages.(session_id, created_at)` - Сортировка сообщений
- `vacancies.idx`, `courses.idx` - Поиск по FAISS индексам

## Обработка данных

**Вакансии и курсы** загружаются из Parquet файлов:
- `data/vacancies.parquet` - ~2000 вакансий с полями title, description, skills, salary
- `data/courses.parquet` - ~3500 курсов с полями name, provider, description, skills
- `data/embeddings/` - Предвычисленные эмбеддинги для семантического поиска

---

# 🧪 Тестирование и отладка

## API тестирование

1. **Swagger UI**: `http://localhost:8044/docs`
2. **Health check**: `GET /health`
3. **Создание сессии**: `POST /sessions`
4. **Тест чата**: `POST /chat/{session_id}`

## Логирование

Система ведет подробные логи:
- Время выполнения каждого этапа траектории
- Количество найденных вакансий/курсов
- Ошибки интеграции с YandexGPT
- Статистика использования FAISS индексов

## Мониторинг производительности

Ключевые метрики:
- **Время построения траектории**: ~10-20 секунд
- **FAISS поиск**: ~100-200мс для 100 результатов
- **LLM запросы**: ~2-5 секунд на запрос
- **Размер эмбеддингов**: ~500MB для всех данных

---

# 🚧 Возможные улучшения

## Краткосрочные (1-2 месяца)
- [ ] Добавить аутентификацию пользователей
- [ ] Кэширование LLM запросов
- [ ] Пагинация результатов поиска
- [ ] Экспорт траекторий в PDF
- [ ] Push-уведомления о дедлайнах

## Среднесрочные (3-6 месяцев)
- [ ] Интеграция с календарем для планирования
- [ ] Система рекомендаций на основе других пользователей
- [ ] A/B тестирование промптов
- [ ] Мобильное приложение
- [ ] Интеграция с HR платформами (HH.ru, LinkedIn)

## Долгосрочные (6+ месяцев)
- [ ] Собственная модель эмбеддингов
- [ ] Мультиязычная поддержка
- [ ] Интеграция с системами обучения (Coursera, Udemy)
- [ ] AI ментор для ежедневного коучинга
- [ ] Корпоративная версия для HR отделов

---

# 📚 Дополнительные ресурсы

## Документация используемых технологий

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) - Веб-фреймворк
- [Pydantic](https://pydantic-docs.helpmanual.io/) - Валидация данных
- [Motor](https://motor.readthedocs.io/) - Async MongoDB драйвер
- [FAISS](https://faiss.ai/) - Семантический поиск
- [YandexGPT SDK](https://cloud.yandex.ru/docs/foundation-models/) - LLM интеграция

### Frontend  
- [Next.js](https://nextjs.org/) - React фреймворк
- [Tailwind CSS](https://tailwindcss.com/) - CSS фреймворк
- [shadcn/ui](https://ui.shadcn.com/) - Компоненты UI
- [Radix UI](https://www.radix-ui.com/) - Примитивы UI
- [Lucide Icons](https://lucide.dev/) - Иконки

### DevOps
- [Docker](https://docs.docker.com/) - Контейнеризация
- [uv](https://docs.astral.sh/uv/) - Python пакетный менеджер
- [MongoDB](https://docs.mongodb.com/) - База данных

## Полезные команды

### Разработка Backend
```bash
# Установка зависимостей
uv sync

# Запуск с автоперезагрузкой  
uv run uvicorn app.main:app --reload

# Запуск тестов
uv run pytest

# Форматирование кода
uv run ruff format app/

# Проверка типов
uv run mypy app/
```

### Разработка Frontend
```bash
# Установка зависимостей
pnpm install

# Запуск dev сервера
pnpm dev

# Сборка для продакшена
pnpm build

# Проверка типов
pnpm type-check

# Линтер
pnpm lint
```

### Docker команды
```bash
# Сборка и запуск
docker compose up --build

# Перезапуск только API
docker compose restart api

# Просмотр логов
docker compose logs -f api

# Остановка всех сервисов
docker compose down
```

---

Этот проект представляет собой полноценную систему карьерного коучинга, использующую современные технологии AI и веб-разработки. Система способна провести интеллектуальное интервью, построить персонализированную карьерную траекторию и дать конкретные рекомендации по развитию.

Основные преимущества:
- ✅ **Персонализация** - учет индивидуальных целей и ограничений
- ✅ **Современные технологии** - YandexGPT, FAISS, Next.js  
- ✅ **Практичность** - конкретные курсы, вакансии и проекты
- ✅ **Масштабируемость** - микросервисная архитектура
- ✅ **UX** - интуитивный интерфейс с современным дизайном
