"use client";
import { useEffect, useState } from "react";

type SetValue<T> = T | ((val: T) => T);

/**
 * Hook para persistir estado no localStorage
 * @param key Chave para armazenamento no localStorage
 * @param initialValue Valor inicial caso não exista dado no localStorage
 * @returns [valor armazenado, função para atualizar valor]
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void] {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") return initialValue;
      
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler ${key} do localStorage:`, error);
      return initialValue;
    }
  });

  // Atualiza localStorage quando o estado muda
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const valueToStore = typeof storedValue === "function"
        ? storedValue(storedValue)
        : storedValue;
        
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
