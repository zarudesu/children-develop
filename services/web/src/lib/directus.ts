import { createDirectus, authentication, rest, readItems, createItem, updateItem, deleteItem, readItem, readMe } from '@directus/sdk';

// Интерфейсы для коллекций Directus
export interface DirectusUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  subscription_type: 'free' | 'basic' | 'premium' | 'family';
  subscription_end_date?: string;
  generations_today: number;
  last_generation_date?: string;
  date_created: string;
  last_access?: string;
}

export interface Generator {
  id: string;
  name: string;
  type: 'filword' | 'reading-text' | 'crossword' | 'math' | 'coloring';
  description?: string;
  params_schema: Record<string, any>;
  is_active: boolean;
  is_premium: boolean;
  sort_order: number;
  date_created: string;
  date_updated?: string;
}

export interface UserGeneration {
  id: string;
  user_id: string;
  generator_id: string;
  params: Record<string, any>;
  pdf_url?: string;
  pdf_file?: string;
  status: 'generating' | 'completed' | 'failed';
  download_count: number;
  generation_time_ms?: number;
  date_created: string;

  // Связанные объекты
  user?: DirectusUser;
  generator?: Generator;
}

// Интерфейс коллекций для типизации SDK
interface DirectusCollections {
  directus_users: DirectusUser[];
  generators: Generator[];
  user_generations: UserGeneration[];
}

// Конфигурация Directus
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL || 'http://localhost:8055';

// Создаем клиент Directus
const directus = createDirectus<DirectusCollections>(DIRECTUS_URL)
  .with(authentication('cookie', {
    credentials: 'include',
    autoRefresh: true
  }))
  .with(rest());

// Вспомогательные функции для работы с API

/**
 * Получение списка активных генераторов
 */
export async function getActiveGenerators(): Promise<Generator[]> {
  try {
    return await directus.request(
      readItems('generators', {
        filter: { is_active: { _eq: true } },
        sort: ['sort_order', 'name'],
        fields: ['*']
      })
    );
  } catch (error) {
    console.error('Error fetching generators:', error);
    return [];
  }
}

/**
 * Получение генератора по ID
 */
export async function getGenerator(id: string): Promise<Generator | null> {
  try {
    return await directus.request(readItem('generators', id));
  } catch (error) {
    console.error('Error fetching generator:', error);
    return null;
  }
}

/**
 * Получение истории генераций пользователя
 */
export async function getUserGenerations(
  userId: string,
  limit = 20,
  offset = 0
): Promise<UserGeneration[]> {
  try {
    return await directus.request(
      readItems('user_generations', {
        filter: { user_id: { _eq: userId } },
        sort: ['-date_created'],
        limit,
        offset,
        fields: [
          '*',
          'generator.name',
          'generator.type',
          'generator.description'
        ]
      })
    );
  } catch (error) {
    console.error('Error fetching user generations:', error);
    return [];
  }
}

/**
 * Создание новой генерации
 */
export async function createUserGeneration(data: {
  user_id: string;
  generator_id: string;
  params: Record<string, any>;
  status?: 'generating' | 'completed' | 'failed';
}): Promise<UserGeneration | null> {
  try {
    return await directus.request(
      createItem('user_generations', {
        ...data,
        status: data.status || 'generating',
        download_count: 0
      })
    );
  } catch (error) {
    console.error('Error creating user generation:', error);
    return null;
  }
}

/**
 * Обновление статуса генерации
 */
export async function updateUserGeneration(
  id: string,
  data: Partial<UserGeneration>
): Promise<UserGeneration | null> {
  try {
    return await directus.request(updateItem('user_generations', id, data));
  } catch (error) {
    console.error('Error updating user generation:', error);
    return null;
  }
}

/**
 * Получение текущего пользователя
 */
export async function getCurrentUser(): Promise<DirectusUser | null> {
  try {
    const user = await directus.request(readMe({
      fields: [
        'id',
        'email',
        'first_name',
        'last_name',
        'role',
        'subscription_type',
        'subscription_end_date',
        'generations_today',
        'last_generation_date',
        'date_created',
        'last_access'
      ]
    }));
    return user as DirectusUser;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Авторизация пользователя
 */
export async function loginUser(email: string, password: string): Promise<DirectusUser | null> {
  try {
    await directus.request(authentication.login({
      email,
      password
    }));
    return await getCurrentUser();
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

/**
 * Выход пользователя
 */
export async function logoutUser(): Promise<void> {
  try {
    await directus.request(authentication.logout());
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Регистрация нового пользователя
 */
export async function registerUser(data: {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}): Promise<DirectusUser | null> {
  try {
    // Создаем пользователя
    const user = await directus.request(
      createItem('directus_users', {
        ...data,
        subscription_type: 'free',
        generations_today: 0,
        status: 'active'
      })
    );

    // Автоматически авторизуем
    await directus.request(authentication.login({
      email: data.email,
      password: data.password
    }));

    return user as DirectusUser;
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
}

/**
 * Проверка лимитов генерации для пользователя
 */
export function checkGenerationLimits(user: DirectusUser, generatorType: string): {
  canGenerate: boolean;
  reason?: string;
  dailyLimit?: number;
  usedToday?: number;
} {
  const limits = {
    free: { generations_per_day: 3, premium_generators: false },
    basic: { generations_per_day: 50, premium_generators: false },
    premium: { generations_per_day: 1000, premium_generators: true },
    family: { generations_per_day: 1000, premium_generators: true }
  };

  const userLimits = limits[user.subscription_type];

  // Проверяем дневной лимит
  if (user.generations_today >= userLimits.generations_per_day) {
    return {
      canGenerate: false,
      reason: 'Превышен дневной лимит генераций',
      dailyLimit: userLimits.generations_per_day,
      usedToday: user.generations_today
    };
  }

  // Проверяем доступ к премиум генераторам
  const premiumGenerators = ['crossword', 'math', 'coloring'];
  if (premiumGenerators.includes(generatorType) && !userLimits.premium_generators) {
    return {
      canGenerate: false,
      reason: 'Требуется премиум подписка для этого генератора'
    };
  }

  return {
    canGenerate: true,
    dailyLimit: userLimits.generations_per_day,
    usedToday: user.generations_today
  };
}

/**
 * Увеличение счетчика генераций пользователя
 */
export async function incrementUserGenerations(userId: string): Promise<void> {
  try {
    const user = await directus.request(readItem('directus_users', userId));
    const today = new Date().toISOString().split('T')[0];

    // Сброс счетчика если новый день
    const generationsToday = user.last_generation_date === today ?
      user.generations_today + 1 : 1;

    await directus.request(
      updateItem('directus_users', userId, {
        generations_today: generationsToday,
        last_generation_date: today
      })
    );
  } catch (error) {
    console.error('Error incrementing user generations:', error);
  }
}

export default directus;