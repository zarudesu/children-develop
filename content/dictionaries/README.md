# Словари слов для генераторов

## Структура

Словари организованы по категориям и уровням сложности:

```
content/dictionaries/
├── animals/           # Животные
├── colors/            # Цвета  
├── school/            # Школьные предметы
├── family/            # Семья
├── food/              # Еда
├── transport/         # Транспорт
├── nature/            # Природа
└── simple/            # Простые слова для начинающих
```

## Форматы файлов

### Основные словари (.txt)
- Один термин на строку
- Только кириллица
- Без дополнительных символов
- Сортировка по алфавиту

### Метаданные (metadata.json)
```json
{
  "title": "Животные",
  "description": "Домашние и дикие животные",
  "ageGroup": "6-10",
  "difficulty": "medium",
  "wordsCount": 25,
  "tags": ["животные", "природа"],
  "lastUpdated": "2025-08-24"
}
```

## Уровни сложности

**Simple (3-6 лет):**
- Слова 3-5 символов
- Конкретные понятия
- Высокочастотная лексика

**Medium (6-10 лет):**
- Слова 4-8 символов
- Школьная лексика
- Тематические группы

**Hard (10+ лет):**
- Слова 5-12 символов  
- Специальная терминология
- Абстрактные понятия

## Использование

### В PDF Service
```typescript
import fs from 'fs';

const loadDictionary = (category: string): string[] => {
  const path = `content/dictionaries/${category}/${category}.ru.txt`;
  return fs.readFileSync(path, 'utf8').split('\n').filter(Boolean);
};
```

### В Core API
```sql
-- Загрузка в PostgreSQL
INSERT INTO dictionaries (name, category, words, metadata)
SELECT 
  'Животные',
  'animals', 
  string_to_array(file_content, E'\n'),
  '{"ageGroup": "6-10", "difficulty": "medium"}'::json
FROM file_imports WHERE filename = 'animals.ru.txt';
```

## Добавление новых словарей

1. Создать папку категории
2. Добавить .txt файл со словами  
3. Создать metadata.json
4. Обновить этот README
5. Протестировать на генерации

## Правила качества

- Только литературный русский язык
- Проверка орфографии обязательна
- Соответствие заявленному возрасту
- Уникальность слов в категории

Подробнее см. [CONTENT_GUIDE.md](../docs/CONTENT_GUIDE.md)
