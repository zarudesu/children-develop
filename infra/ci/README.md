# CI/CD Pipeline конфигурации

## GitHub Actions

### Структура workflows

```
infra/ci/
├── github/
│   ├── test.yml           # Запуск тестов на PR
│   ├── deploy-staging.yml # Деплой в staging  
│   ├── deploy-prod.yml    # Деплой в продакшен
│   └── security.yml       # Security сканирование
└── scripts/
    ├── build.sh           # Сборка образов
    ├── test.sh            # Запуск всех тестов
    └── deploy.sh          # Деплой скрипт
```

### Workflow триггеры

**Pull Request:**
- Запуск всех тестов
- Линтинг кода
- Security scan
- Build проверка

**Push to main:**
- Все проверки из PR
- Автоматический деплой в staging
- Создание release тегов

**Manual deployment:**
- Деплой в продакшен (manual approval)
- Rollback к предыдущей версии

### Secrets настройки

В GitHub Secrets должны быть настроены:
```
PROD_SERVER_HOST=your-server.com
PROD_SERVER_USER=deploy
PROD_SSH_KEY=<private-key>
DOCKER_HUB_USERNAME=username
DOCKER_HUB_TOKEN=<token>
```

## Этапы pipeline

### 1. Test Stage
```bash
# Линтинг
npm run lint
npm run type-check

# Unit тесты
npm test -- --coverage

# Integration тесты  
npm run test:integration

# E2E тесты
npm run test:e2e
```

### 2. Build Stage
```bash
# Сборка Docker образов
docker build -t childdev-web:${COMMIT_SHA} .
docker build -t childdev-pdf:${COMMIT_SHA} .

# Push в registry
docker push childdev-web:${COMMIT_SHA}
docker push childdev-pdf:${COMMIT_SHA}
```

### 3. Deploy Stage
```bash
# SSH на продакшен сервер
ssh $PROD_SERVER_HOST << 'EOF'
  cd /app
  git pull origin main
  docker-compose pull
  docker-compose up -d
EOF
```

## Качество кода

### Pre-commit hooks
```bash
# Установка husky
npm install --save-dev husky lint-staged

# .husky/pre-commit
#!/bin/sh
npm run lint
npm run type-check
npm test -- --passWithNoTests
```

### Проверки качества
- ESLint + Prettier для кода
- Commitlint для commit сообщений
- Dependency vulnerability scanning
- License compatibility check

## Environments

### Staging
- Автоматический деплой из main ветки
- Тестирование новых features
- Доступ по staging.childdev.io

### Production  
- Manual approval для деплоя
- Blue-green deployment стратегия
- Automatic rollback при сбоях

Конфигурации будут добавлены при настройке CI/CD.
