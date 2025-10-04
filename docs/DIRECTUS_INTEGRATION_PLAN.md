# План интеграции Directus с ChildDev

## ✅ Статус тестирования

**Локальная среда с Directus работает!**
- ✅ PostgreSQL запущен на порту 5434
- ✅ Directus доступен на http://localhost:8055
- ✅ Админка отвечает: `{"status":"ok"}`
- ✅ Доступы: admin@childdev.local / directus123

## Этапы интеграции

### Этап 1: Настройка базовой структуры (1-2 дня)

#### 1.1 Конфигурация схемы данных в Directus
```sql
-- Основные коллекции для MVP
users (встроенная Directus коллекция)
├── id, email, password, first_name, last_name
├── subscription_type: "free" | "basic" | "premium" | "family"
├── subscription_end_date
└── created_at, last_login

user_sessions
├── id, user_id, session_token, expires_at
└── device_info, ip_address

generators
├── id, name, type, description
├── params_schema (JSON)
├── is_active, is_premium
└── created_at, updated_at

user_generations
├── id, user_id, generator_id
├── params (JSON), pdf_url
├── created_at, status
└── download_count
```

#### 1.2 Установка Directus SDK в Next.js
```bash
cd services/web
npm install @directus/sdk
```

#### 1.3 Создание клиента Directus
```typescript
// lib/directus.ts
import { createDirectus, authentication, rest } from '@directus/sdk'

interface Collections {
  users: User[]
  generators: Generator[]
  user_generations: UserGeneration[]
}

const directus = createDirectus<Collections>(process.env.DIRECTUS_URL!)
  .with(authentication('cookie', { credentials: 'include' }))
  .with(rest())

export default directus
```

### Этап 2: Система аутентификации (2-3 дня)

#### 2.1 Компоненты аутентификации
```typescript
// components/auth/LoginForm.tsx
interface LoginFormProps {
  onSuccess?: () => void
}

// components/auth/RegisterForm.tsx
interface RegisterFormProps {
  onSuccess?: () => void
}

// components/auth/AuthGuard.tsx
interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredSubscription?: SubscriptionType
}
```

#### 2.2 Middleware для защиты роутов
```typescript
// middleware.ts
import { NextRequest } from 'next/server'
import { checkUserSession } from './lib/auth'

export async function middleware(request: NextRequest) {
  const protectedPaths = ['/dashboard', '/premium-generators']

  if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    const session = await checkUserSession(request)
    if (!session) {
      return Response.redirect(new URL('/login', request.url))
    }
  }
}
```

#### 2.3 Контекст пользователя
```typescript
// contexts/AuthContext.tsx
interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
  isLoading: boolean
}
```

### Этап 3: Интеграция с генераторами (2-3 дня)

#### 3.1 Обновление API роутов
```typescript
// app/api/generate/route.ts
export async function POST(request: Request) {
  const session = await getUserSession(request)

  // Проверка лимитов подписки
  if (!canGeneratePDF(session?.user, generatorType)) {
    return NextResponse.json(
      { error: 'Subscription required' },
      { status: 403 }
    )
  }

  // Генерация PDF
  const pdfBuffer = await generatePDF(params)

  // Сохранение в Directus
  await saveGeneration({
    user_id: session.user.id,
    generator_id: generatorId,
    params,
    pdf_url: await uploadPDF(pdfBuffer)
  })

  return new Response(pdfBuffer, {
    headers: { 'Content-Type': 'application/pdf' }
  })
}
```

#### 3.2 Система лимитов
```typescript
// lib/subscription-limits.ts
const SUBSCRIPTION_LIMITS = {
  free: { generations_per_day: 3, premium_generators: false },
  basic: { generations_per_day: 50, premium_generators: false },
  premium: { generations_per_day: 1000, premium_generators: true },
  family: { generations_per_day: 1000, premium_generators: true, child_accounts: 5 }
}

export function checkGenerationLimit(user: User, generatorType: string): boolean {
  const limits = SUBSCRIPTION_LIMITS[user.subscription_type]

  // Проверяем дневной лимит
  const todayGenerations = getUserGenerationsToday(user.id)
  if (todayGenerations >= limits.generations_per_day) return false

  // Проверяем доступ к премиум генераторам
  if (isPremiumGenerator(generatorType) && !limits.premium_generators) return false

  return true
}
```

### Этап 4: Личный кабинет пользователя (2-3 дня)

#### 4.1 Dashboard компоненты
```typescript
// app/dashboard/page.tsx
interface DashboardProps {
  user: User
  recentGenerations: UserGeneration[]
  subscriptionInfo: SubscriptionInfo
}

// components/dashboard/GenerationHistory.tsx
interface GenerationHistoryProps {
  generations: UserGeneration[]
  onDownload: (generationId: string) => void
  onDelete: (generationId: string) => void
}

// components/dashboard/SubscriptionCard.tsx
interface SubscriptionCardProps {
  subscription: SubscriptionInfo
  onUpgrade: () => void
}
```

#### 4.2 История генераций
```typescript
// lib/user-generations.ts
export async function getUserGenerations(userId: string, limit = 20): Promise<UserGeneration[]> {
  return directus.request(
    readItems('user_generations', {
      filter: { user_id: { _eq: userId } },
      sort: ['-created_at'],
      limit,
      fields: ['*', 'generator.name', 'generator.type']
    })
  )
}

export async function downloadGeneration(generationId: string): Promise<Blob> {
  const generation = await directus.request(
    readItem('user_generations', generationId)
  )

  const response = await fetch(generation.pdf_url)
  return response.blob()
}
```

### Этап 5: Система подписок и платежей (3-4 дня)

#### 5.1 Интеграция ЮKassa
```typescript
// lib/payment/yookassa.ts
interface PaymentData {
  amount: number
  currency: 'RUB'
  description: string
  subscription_type: SubscriptionType
  user_id: string
}

export async function createPayment(data: PaymentData): Promise<string> {
  const payment = await yookassa.createPayment({
    amount: { value: data.amount.toString(), currency: data.currency },
    confirmation: { type: 'redirect', return_url: '/payment/success' },
    metadata: {
      user_id: data.user_id,
      subscription_type: data.subscription_type
    }
  })

  return payment.confirmation.confirmation_url
}
```

#### 5.2 Webhook обработка
```typescript
// app/api/webhooks/payment/route.ts
export async function POST(request: Request) {
  const signature = request.headers.get('x-yookassa-signature')
  const body = await request.text()

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payment = JSON.parse(body)

  if (payment.event === 'payment.succeeded') {
    await updateUserSubscription(
      payment.object.metadata.user_id,
      payment.object.metadata.subscription_type
    )
  }

  return NextResponse.json({ status: 'ok' })
}
```

#### 5.3 Компоненты подписки
```typescript
// components/subscription/PricingCard.tsx
interface PricingCardProps {
  type: SubscriptionType
  price: number
  features: string[]
  isPopular?: boolean
  onSelect: () => void
}

// components/subscription/PaymentModal.tsx
interface PaymentModalProps {
  subscriptionType: SubscriptionType
  onSuccess: () => void
  onCancel: () => void
}
```

### Этап 6: Административная панель (1-2 дня)

#### 6.1 Настройка ролей в Directus
```typescript
// Роли пользователей:
- Public (гости) - только чтение публичных генераторов
- User (авторизованные) - генерация PDF, просмотр своих данных
- Premium (премиум) - доступ к премиум генераторам
- Admin (администраторы) - полный доступ ко всем данным

// Настройка permissions в Directus Admin:
users: read/update own profile
generators: read all, create/update/delete for admins
user_generations: read/create own, read all for admins
```

#### 6.2 Админ дашборд
- Статистика использования генераторов
- Управление пользователями и подписками
- Создание новых генераторов
- Мониторинг платежей

### Этап 7: Деплойment и Production (1-2 дня)

#### 7.1 Обновление production конфигурации
```yaml
# docker-compose.prod.yml
services:
  directus:
    image: directus/directus:latest
    environment:
      - DB_CLIENT=pg
      - DB_HOST=postgres
      - DB_DATABASE=childdev_prod
      - PUBLIC_URL=https://children.hhivp.com/api
      - ADMIN_EMAIL=admin@children.hhivp.com
    ports:
      - "8055:8055"
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=childdev_prod
      - POSTGRES_USER=directus_prod
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
```

#### 7.2 Настройка Nginx
```nginx
# /etc/nginx/sites-available/children.hhivp.com
location /api/ {
    proxy_pass http://localhost:8055/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /admin/ {
    proxy_pass http://localhost:8055/admin/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Временные затраты

| Этап | Описание | Время | Приоритет |
|------|----------|-------|-----------|
| 1 | Настройка схемы данных | 1-2 дня | Высокий |
| 2 | Система аутентификации | 2-3 дня | Высокий |
| 3 | Интеграция с генераторами | 2-3 дня | Высокий |
| 4 | Личный кабинет | 2-3 дня | Средний |
| 5 | Подписки и платежи | 3-4 дня | Высокий |
| 6 | Админ панель | 1-2 дня | Низкий |
| 7 | Production деплойment | 1-2 дня | Средний |

**Общее время: 12-19 дней**

## Риски и решения

### Риск 1: Производительность
**Проблема**: Directus может быть медленнее кастомного API
**Решение**:
- Настройка кэширования через Redis
- Оптимизация запросов с полями и фильтрами
- CDN для статических файлов

### Риск 2: Сложность настройки
**Проблема**: Directus требует понимания его архитектуры
**Решение**:
- Поэтапное внедрение
- Документация каждого шага
- Бэкап точки для отката

### Риск 3: Vendor Lock-in
**Проблема**: Зависимость от Directus
**Решение**:
- Все данные в стандартном PostgreSQL
- API слой через SDK, легко заменяемый
- Возможность экспорта данных

## Выгоды интеграции

### Для разработки
- ⚡ Быстрое создание API без написания backend
- 🎯 Готовая админка для управления контентом
- 🔐 Встроенная система авторизации и ролей
- 📊 Автоматическая генерация TypeScript типов

### Для бизнеса
- 💰 Быстрый запуск монетизации
- 📈 Готовая аналитика и отчеты
- 👥 Удобное управление пользователями
- 🚀 Масштабируемость от MVP до enterprise

### Для пользователей
- 🏠 Личный кабинет с историей
- 💳 Удобная система подписок
- 📱 API готово для мобильных приложений
- ⚡ Быстрая загрузка и отклик

## Следующие шаги

1. **Запустить Этап 1** - настройка схемы данных в Directus
2. **Установить SDK** - добавить @directus/sdk в веб-сервис
3. **Создать базовую аутентификацию** - логин/регистрация
4. **Интегрировать с существующими генераторами** - филворды и чтение
5. **Добавить систему подписок** - ЮKassa интеграция

**Готовы начинать интеграцию?** 🚀