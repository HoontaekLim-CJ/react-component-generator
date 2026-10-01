// localStorage 읽기·쓰기. 깨진 값이나 저장소 오류가 앱을 멈추지 않도록 실패를 삼킨다.

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 공간 부족·접근 차단 시에는 저장을 건너뛴다. 메모리 상태는 그대로 유지된다.
  }
}
