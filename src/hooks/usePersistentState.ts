import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';

/**
 * localStorage와 동기화되는 상태. 초기값은 저장된 값을 `parse`로 검증해 만들고,
 * 값이 바뀔 때마다 다시 저장한다.
 */
export function usePersistentState<T>(
  key: string,
  parse: (raw: unknown) => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(() => parse(loadJSON<unknown>(key, undefined)));

  useEffect(() => {
    saveJSON(key, value);
  }, [key, value]);

  return [value, setValue];
}
