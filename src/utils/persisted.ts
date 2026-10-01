// localStorage에서 읽은 값(unknown)을 앱 타입으로 검증·복원한다. 직접 수정되거나 이전 형식으로 남은 값은 버린다.

import type { GeneratedComponent, Provider } from '../types';

export const STORAGE_KEYS = {
  provider: 'rcg:provider',
  promptHistory: 'rcg:promptHistory',
  components: 'rcg:components',
} as const;

type StoredComponent = Omit<GeneratedComponent, 'createdAt'> & { createdAt: string };

function isStoredComponent(item: unknown): item is StoredComponent {
  if (typeof item !== 'object' || item === null) return false;
  const c = item as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.prompt === 'string' &&
    typeof c.code === 'string' &&
    typeof c.createdAt === 'string' &&
    !Number.isNaN(Date.parse(c.createdAt))
  );
}

export function parseComponents(raw: unknown): GeneratedComponent[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isStoredComponent)
    .map((item) => ({ ...item, createdAt: new Date(item.createdAt) }));
}

const PROVIDERS: Provider[] = ['anthropic', 'google'];
export const DEFAULT_PROVIDER: Provider = 'google';

export function parseProvider(raw: unknown): Provider {
  return PROVIDERS.includes(raw as Provider) ? (raw as Provider) : DEFAULT_PROVIDER;
}

export function parseHistory(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === 'string');
}
