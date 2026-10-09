import { useState, useEffect } from 'react';

/* useState that loads from, and saves to, localStorage.
   `initial` may be a value or a function (used only when storage is empty). */
export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through to the initial value */ }
    return typeof initial === 'function' ? initial() : initial;
  });

  useEffect(() => {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
