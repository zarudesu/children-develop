domain.com

# Следуйте инструкциям для получения сертификатов
```

**Вариант Б: Самоподписанные сертификаты (только для тестирования)**
```bash
./scripts/setup-ssl.sh your-domain.com
# Выберите опцию 2
```

### Шаг 3: Деплой приложения

```bash
# Запускаем деплой
./scripts/deploy-prod.sh
```

Скрипт автоматически:
- Проверит наличие необходимых файлов
- Соберёт Docker образы
- Запустит все сервисы
- Выполнит проверку работоспособности

### Шаг 4: Проверка деплоя

```bash
# Проверяем статус контейнеров
cd infra/docker
docker-compose -f compose.prod.yml ps

# Проверяем логи
docker-compose -f compose.prod.yml logs -f

# Проверяем health endpoints
curl https://your-domain.com/health
curl https://your-domain.com/api/health
```

## Мониторинг и обслуживание

### Логи

```bash
# Все логи
docker-compose -f compose.prod.yml logs

# Логи конкретного сервиса
docker-compose -f compose.prod.yml logs web
docker-compose -f compose.prod.yml logs pdf
docker-compose -f compose.prod.yml logs nginx
```

### Обновление приложения

```bash
# 1. Получаем последние изменения
git pull origin main

# 2. Пересобираем и перезапускаем
./scripts/deploy-prod.sh
```

### Резервное копирование

```bash
# Создаём бэкап настроек
tar -czf backup-$(date +%Y%m%d).tar.gz \
  .env.production \
  infra/nginx/ssl/ \
  content/
```

## Устранение проблем

### Проблема: Контейнеры не запускаются

```bash
# Проверяем Docker
docker --version
docker-compose --version

# Проверяем ресурсы
df -h
free -m

# Перезапускаем сервисы
docker-compose -f compose.prod.yml down
docker-compose -f compose.prod.yml up -d
```

### Проблема: SSL сертификаты

```bash
# Проверяем сертификаты
openssl x509 -in infra/nginx/ssl/fullchain.pem -text -noout

# Обновляем Let's Encrypt
sudo certbot renew
```

### Проблема: Медленная генерация PDF

```bash
# Проверяем ресурсы PDF сервиса
docker stats childdev-pdf

# Увеличиваем лимиты в compose.prod.yml:
# deploy:
#   resources:
#     limits:
#       memory: 1G
#       cpus: '1.0'
```

## Масштабирование

### Горизонтальное масштабирование PDF-сервиса

```yaml
# В compose.prod.yml
pdf:
  deploy:
    replicas: 2
  # ... остальная конфигурация
```

### Добавление кэширования Redis

```yaml
redis:
  image: redis:7-alpine
  container_name: childdev-redis
  restart: unless-stopped
  networks:
    - childdev-network
```

## Безопасность

### Firewall настройки

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Обновления безопасности

```bash
# Регулярно обновляйте систему
sudo apt update && sudo apt upgrade -y

# Обновляйте Docker образы
docker-compose -f compose.prod.yml pull
./scripts/deploy-prod.sh
```

## Мониторинг производительности

### Health check endpoints

- `https://your-domain.com/health` - общий статус
- `https://your-domain.com/api/health` - статус веб-сервиса
- `https://your-domain.com/api/pdf/health` - статус PDF-сервиса (через nginx)

### Метрики для отслеживания

- Время генерации PDF (должно быть < 10 секунд)
- Использование памяти (контейнеры)
- Размер логов
- Статус SSL сертификатов
- Доступность доменного имени

### Алерты

Настройте мониторинг на:
- Недоступность сервиса > 5 минут
- Использование памяти > 80%
- Ошибки генерации PDF > 10% за час
- Истечение SSL сертификатов < 30 дней
