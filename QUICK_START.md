# 🚀 Быстрый старт ChildDev

## На новом компьютере

### 1️⃣ Клонирование
```bash
git clone git@github.com:zarudesu/children-develop.git childdev-cl
cd childdev-cl
```

### 2️⃣ Настройка
```bash
./scripts/dev-setup.sh
```

### 3️⃣ Запуск
```bash
./scripts/run-local.sh
```

### 4️⃣ Открыть
```
http://localhost:3002
```

---

## Требования
- Node.js v18+
- npm
- Git
- Docker (опционально)

## Полная документация
📚 См. `docs/DEV_SETUP_CHECKLIST.md`

## Текущая версия
✅ Последний коммит: `b1c65aa` (UI/UX improvements + dev setup guide)
✅ Production: http://children.hhivp.com:3002
✅ 5 работающих генераторов

## Основные команды
```bash
./scripts/run-local.sh          # Запустить разработку
./scripts/stop-local.sh         # Остановить
./scripts/check-health.sh       # Проверить здоровье
```

## Проблемы?
1. Проверь `docs/DEV_SETUP_CHECKLIST.md` → Troubleshooting
2. Убедись что Node.js v18+: `node --version`
3. Переустанови зависимости: `./scripts/dev-setup.sh`
