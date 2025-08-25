# Docker конфигурации

## Структура

```
infra/docker/
├── compose.local.yml      # Локальная разработка
├── compose.prod.yml       # Продакшен развертывание  
├── compose.monitoring.yml # Мониторинг (опционально)
└── dockerfiles/           # Кастомные Dockerfiles
    ├── web.Dockerfile
    ├── pdf.Dockerfile
    └── api.Dockerfile
```

## Локальная разработка

### Запуск всех сервисов
```bash
docker-compose -f infra/docker/compose.local.yml up -d
```

### Сервисы в local составе:
- **web**: Next.js на порту 3000
- **pdf**: PDF Service на порту 3001  
- **postgres**: PostgreSQL база данных
- **redis**: Кэш и сессии
- **minio**: S3-совместимое хранилище

### Полезные команды
```bash
# Логи сервиса
docker-compose -f infra/docker/compose.local.yml logs web

# Перезапуск сервиса
docker-compose -f infra/docker/compose.local.yml restart pdf

# Остановка всех сервисов
docker-compose -f infra/docker/compose.local.yml down

# Очистка volumes (осторожно!)
docker-compose -f infra/docker/compose.local.yml down -v
```

## Продакшен развертывание

### Особенности prod конфигурации:
- Traefik для SSL terminiation и load balancing
- Health checks для всех сервисов
- Persistent volumes для данных
- Secrets через environment variables
- Multi-stage builds для оптимизации размера

### Запуск продакшен стека:
```bash
# Создание .env файла
cp infra/env/.env.example .env.production

# Запуск
docker-compose -f infra/docker/compose.prod.yml up -d

# Проверка состояния  
docker-compose -f infra/docker/compose.prod.yml ps
```

## Мониторинг (опционально)

Дополнительный стек для наблюдения за системой:
- **Prometheus** - сбор метрик
- **Grafana** - дашборды
- **AlertManager** - уведомления
- **Node Exporter** - метрики сервера

```bash
docker-compose -f infra/docker/compose.monitoring.yml up -d
```

## Кастомные образы

### Оптимизация сборки
- Multi-stage builds для минимизации размера
- Layer caching для ускорения пересборки  
- Использование .dockerignore
- Alpine Linux базовые образы где возможно

### Build контекст
```bash
# Сборка из корня проекта
docker build -f infra/docker/dockerfiles/web.Dockerfile -t childdev-web .
```

## Networking

### Внутренняя сеть
- Все сервисы в одной Docker сети
- Внутренняя коммуникация по именам сервисов
- Только необходимые порты открыты наружу

### Внешний доступ
- **80, 443** - Traefik (HTTP/HTTPS)
- **3000** - Web (только в dev режиме)
- **5432, 6379** - БД (только в dev режиме)

Подробные конфигурации см. в соответствующих .yml файлах.
