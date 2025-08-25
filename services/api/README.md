# services/api (опционально)

Назначение: вынести алгоритмы генераторов в отдельный сервис (если понадобится масштабирование).

- Эндпоинты генерации сеток/ответов
- Контроль валидности параметров│   │   └── index.ts        # Database models
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts        # JWT authentication
│   │   ├── validation.ts  # Request validation
│   │   └── rate-limit.ts  # Rate limiting
│   ├── utils/             # Утилиты
│   │   ├── jwt.ts         # JWT helpers
│   │   ├── hash.ts        # Password hashing
│   │   └── logger.ts      # Logging
│   ├── types/             # TypeScript типы
│   │   ├── api.ts         # API interfaces
│   │   └── database.ts    # Database types
│   └── app.ts             # Main application
├── prisma/                # Database schema
│   ├── schema.prisma      # Prisma schema
│   ├── migrations/        # Database migrations
│   └── seed.ts            # Initial data
├── tests/                 # Tests
├── Dockerfile            # Container
└── package.json
```

## API Endpoints

### Authentication
```typescript
POST /api/v1/auth/register
POST /api/v1/auth/login  
POST /api/v1/auth/refresh
DELETE /api/v1/auth/logout
```

### Dictionaries
```typescript
GET /api/v1/dictionaries              # List all dictionaries
GET /api/v1/dictionaries/:id          # Get specific dictionary
GET /api/v1/dictionaries/category/:cat # Get by category
POST /api/v1/dictionaries             # Create new dictionary (admin)
PUT /api/v1/dictionaries/:id          # Update dictionary (admin)
DELETE /api/v1/dictionaries/:id       # Delete dictionary (admin)
```

### Generators
```typescript
POST /api/v1/generate                 # Generate new content
GET /api/v1/generate/:id              # Get generation result
GET /api/v1/generate/history          # User generation history
DELETE /api/v1/generate/:id           # Delete generation
```

### Users (будущее)
```typescript
GET /api/v1/users/profile             # User profile
PUT /api/v1/users/profile             # Update profile
GET /api/v1/users/settings            # User settings
PUT /api/v1/users/settings            # Update settings
GET /api/v1/users/statistics          # Usage statistics
```

## Database Schema

### Prisma Schema
```prisma
// prisma/schema.prisma

model Dictionary {
  id          String   @id @default(cuid())
  name        String
  category    String
  ageGroup    String
  difficulty  String
  words       String[] // массив слов
  metadata    Json     // дополнительные данные
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("dictionaries")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  profile       Json     // профиль пользователя
  settings      Json     // настройки
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  generations   Generation[]
  
  @@map("users")
}

model Generation {
  id           String   @id @default(cuid())
  type         String   // filword, crossword, etc.
  parameters   Json     // параметры генерации
  status       String   // pending, completed, failed
  downloadUrl  String?  // ссылка на файл
  previewUrl   String?  // ссылка на превью
  metadata     Json     // дополнительные данные
  createdAt    DateTime @default(now())
  
  userId       String?
  user         User?    @relation(fields: [userId], references: [id])
  
  @@map("generations")
}
```

### Миграции
```bash
# Создание миграции
npx prisma migrate dev --name init

# Применение миграций в продакшене
npx prisma migrate deploy

# Заполнение начальными данными
npx prisma db seed
```

## Business Logic Services

### WordService
```typescript
export class WordService {
  async getDictionaries(filters?: DictionaryFilters): Promise<Dictionary[]> {
    return this.prisma.dictionary.findMany({
      where: {
        category: filters?.category,
        ageGroup: filters?.ageGroup,
        difficulty: filters?.difficulty,
      }
    });
  }

  async searchWords(query: string, categories?: string[]): Promise<SearchResult[]> {
    // Full-text search в PostgreSQL
    const results = await this.prisma.$queryRaw`
      SELECT * FROM dictionaries 
      WHERE to_tsvector('russian', array_to_string(words, ' ')) @@ plainto_tsquery('russian', ${query})
      ${categories ? Prisma.sql`AND category = ANY(${categories})` : Prisma.empty}
    `;
    
    return results;
  }

  async getRandomWords(category: string, count: number): Promise<string[]> {
    const dictionary = await this.prisma.dictionary.findFirst({
      where: { category }
    });
    
    return shuffle(dictionary.words).slice(0, count);
  }
}
```

### GeneratorHub
```typescript
export class GeneratorHub {
  private generators = new Map<string, GeneratorInterface>();

  constructor() {
    // Регистрация доступных генераторов
    this.generators.set('filword', new FilwordGenerator());
    this.generators.set('crossword', new CrosswordGenerator());
    this.generators.set('anagram', new AnagramGenerator());
  }

  async generate(request: GeneratorRequest): Promise<GeneratorResponse> {
    const generator = this.generators.get(request.type);
    if (!generator) {
      throw new Error(`Unknown generator type: ${request.type}`);
    }

    // Сохранение запроса в БД
    const generation = await this.prisma.generation.create({
      data: {
        type: request.type,
        parameters: request.parameters,
        status: 'pending',
        userId: request.userId,
      }
    });

    try {
      // Вызов соответствующего сервиса генерации
      const result = await generator.generate(request.parameters);
      
      // Обновление статуса
      await this.prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'completed',
          downloadUrl: result.downloadUrl,
          previewUrl: result.previewUrl,
          metadata: result.metadata,
        }
      });

      return {
        id: generation.id,
        type: request.type,
        downloadUrl: result.downloadUrl,
        previewUrl: result.previewUrl,
        metadata: result.metadata,
      };

    } catch (error) {
      await this.prisma.generation.update({
        where: { id: generation.id },
        data: { status: 'failed' }
      });
      throw error;
    }
  }
}
```

### UserService
```typescript
export class UserService {
  async register(email: string, password: string): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: { name: '', avatar: null },
        settings: { 
          defaultGridSize: '14x14',
          preferredCategories: [],
          language: 'ru'
        }
      }
    });
  }

  async authenticate(email: string, password: string): Promise<{ user: User, token: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { user, token };
  }

  async getUserStatistics(userId: string): Promise<UserStatistics> {
    const generations = await this.prisma.generation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return {
      totalGenerations: generations.length,
      generationsByType: groupBy(generations, 'type'),
      recentActivity: generations.slice(0, 10),
      favoriteCategories: this.calculateFavoriteCategories(generations)
    };
  }
}
```

## Интеграция сервисов

### Communication patterns

**Web Frontend → Core API:**
```typescript
// В Web Frontend
const response = await fetch('/api/v1/dictionaries/animals', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const dictionary = await response.json();
```

**Core API → PDF Service:**
```typescript
// В Core API
async generatePDF(params: FilwordParams): Promise<GenerationResult> {
  const response = await fetch(`${PDF_SERVICE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  const pdf = await response.blob();
  
  // Сохранение в S3
  const downloadUrl = await this.storageService.uploadPDF(pdf, generateId());
  
  return { downloadUrl, metadata: extractMetadata(params) };
}
```

## Разработка и тестирование

### Локальный запуск
```bash
cd services/api

# Установка зависимостей
npm install

# Настройка БД
cp .env.example .env
npx prisma migrate dev
npx prisma db seed

# Запуск в dev режиме
npm run dev  # Запуск на порту 3002
```

### Testing
```bash
# Unit тесты
npm test

# Integration тесты
npm run test:integration

# E2E API тесты  
npm run test:api
```

### Docker
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Prisma требует native binaries
RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY . .

EXPOSE 3002

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

## Мониторинг и метрики

### API Metrics
```typescript
// Prometheus метрики
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds', 
  help: 'Duration of database queries',
  labelNames: ['operation', 'table']
});
```

### Health Checks
```typescript
GET /api/v1/health
{
  "status": "ok",
  "timestamp": "2025-08-24T10:30:00Z",
  "version": "1.0.0",
  "dependencies": {
    "database": "ok",
    "redis": "ok", 
    "pdfService": "ok"
  }
}
```

## Планы развития

### Phase 1: Базовый API
- [ ] CRUD для словарей
- [ ] Интеграция с PDF Service
- [ ] Базовая аналитика

### Phase 2: Пользователи
- [ ] Регистрация и аутентификация
- [ ] Персональные настройки
- [ ] История генераций

### Phase 3: Расширение
- [ ] API для мобильных приложений  
- [ ] Webhook система
- [ ] Multi-tenant архитектура
- [ ] GraphQL endpoint

### Phase 4: ML и рекомендации
- [ ] Персонализированные словари
- [ ] Умные рекомендации категорий
- [ ] A/B тесты генераторов
- [ ] Predictive analytics
