# Руководство по развертыванию Directus для ChildDev

## 🚀 Быстрое развертывание

### Локальная разработка

```bash
# 1. Запуск Directus + основные сервисы
./scripts/run-local-with-directus.sh

# 2. Доступ к админке
# http://localhost:8055/admin
# Email: admin@childdev.local
# Password: directus123

# 3. Остановка
./scripts/stop-local-directus.sh
```

### Продакшен (children.hhivp.com)

```bash
# 1. Подготовка конфигурации
cp .env.directus-prod.example .env.directus-prod
nano .env.directus-prod  # Заполните реальные значения

# 2. Развертывание на сервере
./scripts/deploy-directus-prod.sh

# 3. Доступ к админке
# https://children.hhivp.com/admin
# Email: admin@children.hhivp.com
# Password: [из .env.directus-prod]
```

## 📋 Структура интеграции

### Созданные файлы

#### Конфигурация
- `.env.directus-prod.example` — шаблон переменных для продакшена
- `.env.directus-local` — переменные для локальной разработки (автоматически создается)
- `docker-compose.directus-prod.yml` — Docker конфигурация для продакшена
- `docker-compose.directus-local.yml` — Docker конфигурация для разработки (автоматически создается)

#### Код интеграции
- `services/web/src/lib/directus.ts` — клиент Directus с TypeScript типами
- `scripts/setup-directus-schema.js` — автоматическая настройка схемы данных

#### Скрипты развертывания
- `scripts/deploy-directus-prod.sh` — полное развертывание на продакшене
- `scripts/run-local-with-directus.sh` — запуск локальной среды с Directus
- `scripts/stop-local-directus.sh` — остановка локальной среды (автоматически создается)

### Схема данных

#### Коллекции Directus

1. **directus_users** (расширенная встроенная коллекция)
   - `subscription_type`: 'free' | 'basic' | 'premium' | 'family'
   - `subscription_end_date`: дата окончания подписки
   - `generations_today`: счетчик генераций за день
   - `last_generation_date`: дата последней генерации

2. **generators** (новая коллекция)
   - `name`: название генератора
   - `type`: 'filword' | 'reading-text' | 'crossword' | 'math' | 'coloring'
   - `description`: описание
   - `params_schema`: JSON схема параметров
   - `is_active`: активен ли генератор
   - `is_premium`: требует ли премиум подписку
   - `sort_order`: порядок сортировки

3. **user_generations** (новая коллекция)
   - `user_id`: связь с пользователем
   - `generator_id`: связь с генератором
   - `params`: параметры генерации (JSON)
   - `pdf_url`: ссылка на PDF файл
   - `pdf_file`: файл в Directus
   - `status`: 'generating' | 'completed' | 'failed'
   - `download_count`: количество скачиваний
   - `generation_time_ms`: время генерации

#### Роли пользователей
- **ChildDev User**: обычные пользователи с базовым доступом
- **ChildDev Premium**: премиум пользователи с расширенным доступом

## 🔧 Настройка переменных окружения

### Продакшен (.env.directus-prod)

```bash
# Критически важные переменные (ОБЯЗАТЕЛЬНО изменить!)
DIRECTUS_KEY=your-super-secret-directus-key-32-chars
DIRECTUS_SECRET=your-super-secret-directus-secret-64-chars
DIRECTUS_DB_PASSWORD=your-secure-database-password
DIRECTUS_ADMIN_EMAIL=admin@children.hhivp.com
DIRECTUS_ADMIN_PASSWORD=your-secure-admin-password

# Redis
REDIS_PASSWORD=your-redis-password

# Платежи ЮKassa
YOOKASSA_SHOP_ID=your_yookassa_shop_id
YOOKASSA_SECRET_KEY=your_yookassa_secret_key

# Email (опционально)
EMAIL_FROM=noreply@children.hhivp.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Бэкапы (опционально)
BACKUP_ENCRYPTION_KEY=your-backup-encryption-key
S3_BACKUP_BUCKET=childdev-backups
S3_ACCESS_KEY=your-s3-access-key
S3_SECRET_KEY=your-s3-secret-key
```

### Локальная разработка (.env.directus-local)

```bash
# Автоматически создается со значениями по умолчанию
DIRECTUS_KEY=d41d8cd98f00b204e9800998ecf8427e
DIRECTUS_SECRET=6dbd9a8e8fb85e4a3c09c6c5dc2a7a7b7f6c3e2f1a9b8c7d6e5f4a3b2c1d0e9f8
DIRECTUS_DB_PASSWORD=directus123
DIRECTUS_ADMIN_EMAIL=admin@childdev.local
DIRECTUS_ADMIN_PASSWORD=directus123
REDIS_PASSWORD=redis123
```

## 🐳 Docker конфигурация

### Сервисы

#### Продакшен
- **postgres-directus**: PostgreSQL 15 на порту 5432
- **directus**: Directus CMS на порту 8055
- **redis**: Redis 7 на порту 6379
- **childdev-web**: Next.js приложение на порту 3002
- **childdev-pdf**: PDF сервис на порту 3001

#### Локальная разработка
- **postgres-directus-local**: PostgreSQL 15 на порту 5434
- **directus-local**: Directus CMS на порту 8055
- **redis-local**: Redis 7 на порту 6380 (опционально)

### Volumes
- `postgres_directus_data`: данные PostgreSQL
- `directus_uploads`: загруженные файлы Directus
- `directus_data`: данные приложения Directus
- `redis_data`: данные Redis

## 🌐 Nginx конфигурация

Скрипт развертывания автоматически добавляет в конфигурацию Nginx:

```nginx
# Directus API
location /api/ {
    proxy_pass http://localhost:8055/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $server_name;

    # WebSocket support
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}

# Directus Admin
location /admin/ {
    proxy_pass http://localhost:8055/admin/;
    # ... аналогичные заголовки
}
```

## 🔒 Безопасность

### Продакшен
- Уникальные ключи DIRECTUS_KEY и DIRECTUS_SECRET
- Сложные пароли для всех сервисов
- HTTPS через Nginx + Let's Encrypt
- Ограничение доступа к админке
- Rate limiting включен

### Локальная разработка
- Стандартные тестовые ключи
- Простые пароли для удобства
- HTTP соединения
- Rate limiting отключен
- Подробное логирование

## 🔍 Мониторинг и логи

### Проверка состояния
```bash
# Статус контейнеров
docker-compose -f docker-compose.directus-prod.yml ps

# Health checks
curl https://children.hhivp.com/api/server/health
curl http://localhost:8055/server/health  # локально

# Логи
docker-compose -f docker-compose.directus-prod.yml logs -f directus
docker-compose -f docker-compose.directus-local.yml logs -f directus-local
```

### Важные эндпоинты
- `GET /server/health` — проверка здоровья Directus
- `GET /server/info` — информация о сервере
- `GET /server/ping` — простая проверка доступности

## 🚨 Troubleshooting

### Частые проблемы

#### Directus не запускается
```bash
# Проверить логи
docker-compose -f docker-compose.directus-prod.yml logs directus

# Перезапустить контейнер
docker-compose -f docker-compose.directus-prod.yml restart directus

# Полная пересборка
docker-compose -f docker-compose.directus-prod.yml down
docker-compose -f docker-compose.directus-prod.yml up -d --build
```

#### Ошибки аутентификации
```bash
# Проверить переменные окружения
docker-compose -f docker-compose.directus-prod.yml exec directus env | grep DIRECTUS

# Сбросить администратора
docker-compose -f docker-compose.directus-prod.yml exec directus npx directus users create --email admin@children.hhivp.com --password newpassword --role administrator
```

#### Проблемы с базой данных
```bash
# Подключиться к PostgreSQL
docker-compose -f docker-compose.directus-prod.yml exec postgres-directus psql -U directus_prod -d childdev_directus_prod

# Проверить таблицы
\dt

# Проверить пользователей Directus
SELECT id, email, first_name, status FROM directus_users;
```

#### Nginx проблемы
```bash
# Проверить конфигурацию
sudo nginx -t

# Перезагрузить Nginx
sudo systemctl reload nginx

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 📚 Дальнейшие шаги

### 1. Интеграция с веб-приложением
- Обновить компоненты для использования Directus API
- Добавить аутентификацию через Directus
- Интегрировать систему лимитов подписки

### 2. Настройка платежей
- Подключить ЮKassa webhook
- Создать страницы оплаты подписки
- Настроить автоматическое обновление подписок

### 3. Контент-менеджмент
- Добавить тестовые генераторы через админку
- Настроить роли и разрешения
- Создать пользовательские коллекции

### 4. Мониторинг и бэкапы
- Настроить автоматические бэкапы базы данных
- Добавить мониторинг производительности
- Создать алерты для критичных ошибок

## 🔗 Полезные ссылки

- [Документация Directus](https://docs.directus.io/)
- [Directus SDK для JavaScript](https://docs.directus.io/guides/sdk/getting-started.html)
- [Docker Compose документация](https://docs.docker.com/compose/)
- [План интеграции Directus](./DIRECTUS_INTEGRATION_PLAN.md)