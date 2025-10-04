#!/usr/bin/env node

/**
 * Скрипт автоматической настройки схемы данных в Directus для ChildDev
 * Создает все необходимые коллекции, поля и роли
 */

const { createDirectus, rest, authentication, readCollections, createCollection, createField, createRole, createPermission } = require('@directus/sdk');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@childdev.local';
const DIRECTUS_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'directus123';

// Создаем клиент Directus
const directus = createDirectus(DIRECTUS_URL)
  .with(authentication())
  .with(rest());

async function setupDirectusSchema() {
  try {
    console.log('🚀 Начинаем настройку схемы данных Directus...');

    // Авторизуемся
    await directus.login(DIRECTUS_EMAIL, DIRECTUS_PASSWORD, {});
    console.log('✅ Авторизация успешна');

    // Проверяем существующие коллекции
    const existingCollections = await directus.request(readCollections());
    const collectionNames = existingCollections.map(c => c.collection);

    // 1. Создаем коллекцию генераторов
    if (!collectionNames.includes('generators')) {
      console.log('📊 Создаем коллекцию generators...');

      await directus.request(createCollection({
        collection: 'generators',
        meta: {
          collection: 'generators',
          note: 'Доступные генераторы образовательного контента',
          display_template: '{{name}} ({{type}})',
          hidden: false,
          singleton: false,
          icon: 'functions',
          color: '#6366F1'
        },
        schema: {
          name: 'generators'
        }
      }));

      // Поля для generators
      const generatorFields = [
        {
          field: 'name',
          type: 'string',
          meta: { display: 'formatted-value', readonly: false, hidden: false, width: 'full' },
          schema: { max_length: 255, is_nullable: false }
        },
        {
          field: 'type',
          type: 'string',
          meta: {
            display: 'dropdown',
            options: {
              choices: [
                { text: 'Филворд', value: 'filword' },
                { text: 'Тексты для чтения', value: 'reading-text' },
                { text: 'Кроссворд', value: 'crossword' },
                { text: 'Математика', value: 'math' },
                { text: 'Раскраска', value: 'coloring' }
              ]
            }
          },
          schema: { max_length: 50, is_nullable: false }
        },
        {
          field: 'description',
          type: 'text',
          meta: { display: 'wysiwyg' }
        },
        {
          field: 'params_schema',
          type: 'json',
          meta: {
            display: 'formatted-json-value',
            note: 'JSON схема параметров генератора'
          }
        },
        {
          field: 'is_active',
          type: 'boolean',
          meta: { display: 'boolean' },
          schema: { default_value: true }
        },
        {
          field: 'is_premium',
          type: 'boolean',
          meta: { display: 'boolean' },
          schema: { default_value: false }
        },
        {
          field: 'sort_order',
          type: 'integer',
          meta: { display: 'input' },
          schema: { default_value: 1 }
        }
      ];

      for (const field of generatorFields) {
        await directus.request(createField('generators', field));
      }

      console.log('✅ Коллекция generators создана');
    }

    // 2. Расширяем встроенную коллекцию users
    console.log('👤 Расширяем коллекцию пользователей...');

    const userFields = [
      {
        field: 'subscription_type',
        type: 'string',
        meta: {
          display: 'dropdown',
          options: {
            choices: [
              { text: 'Бесплатная', value: 'free' },
              { text: 'Базовая', value: 'basic' },
              { text: 'Премиум', value: 'premium' },
              { text: 'Семейная', value: 'family' }
            ]
          }
        },
        schema: { max_length: 20, default_value: 'free' }
      },
      {
        field: 'subscription_end_date',
        type: 'dateTime',
        meta: { display: 'datetime' }
      },
      {
        field: 'generations_today',
        type: 'integer',
        meta: { display: 'input', readonly: true },
        schema: { default_value: 0 }
      },
      {
        field: 'last_generation_date',
        type: 'date',
        meta: { display: 'datetime', readonly: true }
      }
    ];

    for (const field of userFields) {
      try {
        await directus.request(createField('directus_users', field));
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }

    // 3. Создаем коллекцию пользовательских генераций
    if (!collectionNames.includes('user_generations')) {
      console.log('📄 Создаем коллекцию user_generations...');

      await directus.request(createCollection({
        collection: 'user_generations',
        meta: {
          collection: 'user_generations',
          note: 'История генераций пользователей',
          display_template: '{{generator.name}} - {{user.first_name}} {{user.last_name}}',
          hidden: false,
          singleton: false,
          icon: 'history',
          color: '#10B981'
        },
        schema: {
          name: 'user_generations'
        }
      }));

      const generationFields = [
        {
          field: 'user_id',
          type: 'uuid',
          meta: {
            display: 'related-values',
            display_options: { template: '{{first_name}} {{last_name}}' }
          },
          schema: { foreign_key_table: 'directus_users', foreign_key_column: 'id' }
        },
        {
          field: 'generator_id',
          type: 'uuid',
          meta: {
            display: 'related-values',
            display_options: { template: '{{name}}' }
          },
          schema: { foreign_key_table: 'generators', foreign_key_column: 'id' }
        },
        {
          field: 'params',
          type: 'json',
          meta: {
            display: 'formatted-json-value',
            note: 'Параметры генерации'
          }
        },
        {
          field: 'pdf_url',
          type: 'string',
          meta: { display: 'formatted-value' },
          schema: { max_length: 500 }
        },
        {
          field: 'pdf_file',
          type: 'uuid',
          meta: { display: 'file' },
          schema: { foreign_key_table: 'directus_files', foreign_key_column: 'id' }
        },
        {
          field: 'status',
          type: 'string',
          meta: {
            display: 'dropdown',
            options: {
              choices: [
                { text: 'Создается', value: 'generating' },
                { text: 'Готово', value: 'completed' },
                { text: 'Ошибка', value: 'failed' }
              ]
            }
          },
          schema: { max_length: 20, default_value: 'generating' }
        },
        {
          field: 'download_count',
          type: 'integer',
          meta: { display: 'input' },
          schema: { default_value: 0 }
        },
        {
          field: 'generation_time_ms',
          type: 'integer',
          meta: { display: 'input', note: 'Время генерации в миллисекундах' }
        }
      ];

      for (const field of generationFields) {
        await directus.request(createField('user_generations', field));
      }

      console.log('✅ Коллекция user_generations создана');
    }

    // 4. Создаем роли
    console.log('🔐 Создаем роли пользователей...');

    const roles = [
      {
        name: 'ChildDev User',
        description: 'Обычный пользователь ChildDev с базовым доступом',
        icon: 'person',
        admin_access: false,
        app_access: false
      },
      {
        name: 'ChildDev Premium',
        description: 'Премиум пользователь с расширенным доступом',
        icon: 'star',
        admin_access: false,
        app_access: false
      }
    ];

    for (const role of roles) {
      try {
        await directus.request(createRole(role));
        console.log(`✅ Роль "${role.name}" создана`);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`⚠️ Роль "${role.name}" уже существует`);
        }
      }
    }

    // 5. Заполняем тестовые данные
    console.log('🔧 Добавляем тестовые генераторы...');

    const testGenerators = [
      {
        name: 'Филворд',
        type: 'filword',
        description: 'Создание филвордов с заданными словами и параметрами сетки',
        params_schema: {
          words: { type: 'array', required: true },
          gridSize: { type: 'string', enum: ['10x10', '12x12', '14x14', '16x16', '18x18', '20x20'] },
          directions: { type: 'object' },
          textCase: { type: 'string', enum: ['upper', 'lower'] }
        },
        is_active: true,
        is_premium: false,
        sort_order: 1
      },
      {
        name: 'Тексты для чтения',
        type: 'reading-text',
        description: '12 типов упражнений для развития техники чтения',
        params_schema: {
          text: { type: 'string', required: true },
          transformType: {
            type: 'string',
            enum: ['normal', 'scrambled-words', 'mirror-text', 'word-ladder', 'missing-vowels', 'syllable-division', 'reading-speed', 'comprehension', 'punctuation', 'intonation', 'expression', 'fluency']
          },
          fontSize: { type: 'string', enum: ['small', 'medium', 'large'] }
        },
        is_active: true,
        is_premium: false,
        sort_order: 2
      },
      {
        name: 'Кроссворд',
        type: 'crossword',
        description: 'Создание классических кроссвордов',
        params_schema: {
          words: { type: 'array', required: true },
          gridSize: { type: 'string' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] }
        },
        is_active: true,
        is_premium: true,
        sort_order: 3
      }
    ];

    // Используем прямой SQL для вставки, так как API может не работать на этом этапе
    console.log('ℹ️ Тестовые данные будут добавлены через админку Directus');

    console.log('\n🎉 Схема данных Directus успешно настроена!');
    console.log('\n📋 Следующие шаги:');
    console.log('1. Откройте админку: http://localhost:8055/admin');
    console.log('2. Войдите с учетными данными: admin@childdev.local / directus123');
    console.log('3. Проверьте созданные коллекции: generators, user_generations');
    console.log('4. Добавьте тестовые данные через интерфейс');

  } catch (error) {
    console.error('❌ Ошибка при настройке схемы:', error);
    process.exit(1);
  }
}

// Запускаем настройку если скрипт вызван напрямую
if (require.main === module) {
  setupDirectusSchema();
}

module.exports = { setupDirectusSchema };