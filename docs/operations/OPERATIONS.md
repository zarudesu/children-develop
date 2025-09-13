# Операционное руководство

## Развертывание и домены

### Доменная структура

**Продакшен:**
- `childdev.io` - основной домен 
- `www.childdev.io` - редирект на основной
- `api.childdev.io` - API endpoints (будущее)
- `cdn.childdev.io` - статические ресурсы

**Staging:**
- `staging.childdev.io` - тестовая среда
- `dev.childdev.io` - среда разработки

### SSL/TLS сертификаты

**Let's Encrypt автообновление:**
```yaml
# docker-compose.yml
services:
  traefik:
    command:
      - --certificatesresolvers.letsencrypt.acme.email=admin@childdev.io
      - --certificatesresolvers.letsencrypt.acme.storage=/certificates/acme.json
      - --certificatesresolvers.letsencrypt.acme.tlschallenge=true
```

**Мониторинг сертификатов:**
- Автоматические проверки срока действия
- Алерты за 30 дней до истечения
- Бэкап сертификатов в безопасное хранилище

## Локальная разработка

### Быстрый старт
```bash
# Клонирование и настройка
git clone https://github.com/username/childdev-cl
cd childdev-cl
cp infra/env/.env.local.example .env.local

# Запуск всех сервисов
docker-compose -f infra/docker/compose.local.yml up -d

# Проверка состояния
./scripts/check-health.sh
```

### Переменные окружения (.env.local)
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/childdev"
REDIS_URL="redis://localhost:6379"

# Services  
WEB_PORT=3000
PDF_SERVICE_PORT=3001
PDF_SERVICE_URL="http://localhost:3001"

# Security
JWT_SECRET="development-secret-change-in-production"
RATE_LIMIT_MAX=100

# External Services
S3_BUCKET="childdev-dev"
S3_ACCESS_KEY="minioaccess"
S3_SECRET_KEY="miniosecret"
```

### Работа с базой данных
```bash
# Миграции
npm run db:migrate

# Заполнение тестовыми данными
npm run db:seed

# Бэкап локальной БД
npm run db:backup
```

## Продакшен развертывание

### Сервер требования (MVP)
- **CPU:** 4 cores, 2.5GHz+
- **RAM:** 8GB (4GB для PDF Service + Chromium)
- **Disk:** 100GB SSD
- **Network:** 1Gbps, безлимитный трафик
- **OS:** Ubuntu 22.04 LTS

### Развертывание через Docker
```bash
# На продакшен сервере
git clone https://github.com/username/childdev-cl
cd childdev-cl

# Настройка production переменных
cp infra/env/.env.example .env.production
# Редактируем .env.production с реальными значениями

# Запуск продакшен стека
docker-compose -f infra/docker/compose.prod.yml up -d

# Проверка
curl https://childdev.io/api/health
```

### CI/CD Pipeline (GitHub Actions)

**Автоматический деплой при push в main:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          ssh ${{ secrets.PROD_SERVER }} 'cd /app && git pull && docker-compose up -d'
```

**Тестирование перед деплоем:**
```yaml
# .github/workflows/test.yml  
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm test
      - run: npm run test:e2e
```

## Мониторинг

### Основные метрики для отслеживания

**Производительность:**
- Время генерации PDF (p50, p95, p99)
- Использование памяти Chromium
- CPU utilization по сервисам
- Disk I/O и свободное место

**Доступность:**  
- Uptime основных endpoints
- Response time API
- Error rate (4xx, 5xx)
- SSL certificate expiry

**Бизнес метрики:**
- Количество генераций в день
- Популярные размеры сеток
- Top категории слов
- Конверсия в скачивания

### Настройка мониторинга

**Prometheus + Grafana:**
```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus
    ports: [9090:9090]
    volumes: 
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:  
    image: grafana/grafana
    ports: [3000:3000]
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=secure_password
```

**Алерты в Slack/Email:**
```yaml
# alertmanager.yml
route:
  receiver: 'slack-notifications'
  
receivers:
  - name: 'slack-notifications'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/...'
        channel: '#alerts'
        text: 'Alert: {{ .CommonAnnotations.summary }}'
```

### Логирование

**Centralized logging (ELK Stack):**
```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    
  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    
  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports: [5601:5601]
```

**Log format (JSON):**
```json
{
  "timestamp": "2025-08-24T10:30:00Z",
  "level": "info",
  "service": "pdf-service",
  "traceId": "abc123",
  "message": "PDF generated successfully",
  "meta": {
    "gridSize": "14x14",
    "wordsCount": 8,
    "generationTime": 3.2
  }
}
```

## Резервное копирование

### База данных (PostgreSQL)
```bash
# Ежедневный бэкап в 2:00
0 2 * * * pg_dump -h localhost -U postgres childdev > /backups/db_$(date +%Y%m%d).sql

# Недельный бэкап с сжатием  
0 2 * * 0 pg_dump -h localhost -U postgres childdev | gzip > /backups/weekly/db_$(date +%Y%m%d).sql.gz

# Очистка старых бэкапов (старше 30 дней)
find /backups -name "*.sql" -mtime +30 -delete
```

### Файлы конфигурации
```bash
# Бэкап важных конфигов
rsync -av /app/infra/env/ backup-server:/backups/configs/
rsync -av /app/docker-compose*.yml backup-server:/backups/configs/
```

### S3/MinIO данные
```bash
# Синхронизация между регионами
mc mirror local-minio/childdev-bucket remote-s3/childdev-backup
```

## Обновления и безопасность

### Обновление зависимостей
```bash
# Проверка уязвимостей
npm audit
docker scout cves

# Обновление с тестированием
npm update
npm test
npm run test:e2e
```

### Security checklist
- [ ] Все пароли в переменных окружения
- [ ] JWT secrets достаточно сложные
- [ ] Rate limiting настроен
- [ ] CORS headers корректные  
- [ ] Headers безопасности (Helmet.js)
- [ ] Input validation на всех endpoints
- [ ] SQL injection защита
- [ ] XSS protection

### Disaster Recovery план

**RTO (Recovery Time Objective):** 4 часа
**RPO (Recovery Point Objective):** 1 час

**Сценарий 1: Отказ основного сервера**
1. DNS переключение на backup сервер (5 минут)
2. Восстановление БД из последнего бэкапа (30 минут)  
3. Запуск сервисов на новом сервере (15 минут)
4. Тестирование функциональности (30 минут)

**Сценарий 2: Повреждение базы данных**
1. Остановка приложения (2 минуты)
2. Восстановление из point-in-time backup (45 минут)
3. Перезапуск сервисов (5 минут)
4. Валидация данных (30 минут)

**Контакты для экстренных ситуаций:**
- DevOps Lead: +7-XXX-XXX-XXXX
- System Admin: +7-XXX-XXX-XXXX  
- Hosting Support: support@hosting.com

## Troubleshooting

### Частые проблемы

**PDF Service не отвечает:**
```bash
# Проверка логов
docker logs childdev-pdf-service

# Проверка ресурсов
docker stats childdev-pdf-service  

# Перезапуск сервиса
docker-compose restart pdf-service
```

**Высокое потребление памяти:**
```bash
# Chromium процессы
ps aux | grep chrome

# Очистка кэша
redis-cli FLUSHDB

# Перезапуск с очисткой
docker-compose down && docker system prune -f && docker-compose up -d
```

**Медленная генерация PDF:**
- Проверить нагрузку на CPU/RAM
- Очистить временные файлы Chromium  
- Проверить размер swap файла
- Увеличить timeout генерации

### Полезные команды
```bash
# Проверка состояния всех сервисов
docker-compose ps

# Просмотр логов в реальном времени
docker-compose logs -f

# Подключение к БД
docker-compose exec postgres psql -U postgres childdev

# Очистка Docker ресурсов
docker system prune -af --volumes

# Бэкап БД "на лету"
docker-compose exec postgres pg_dump -U postgres childdev > backup.sql
```
