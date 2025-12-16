// Función para eliminar acentos y diacríticos
export const normalizeText = (text: string) => {
  return text
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .toLowerCase()
    .trim();
};

export const advancedSearch = <T>(
  data: T[], 
  query: string, 
  keys: (keyof T)[] 
): T[] => {
  if (!query) return data;

  const normalizedQuery = normalizeText(query);

  return data.filter((item) => {
    return keys.some((key) => {
      const value = item[key];
      if (typeof value === 'string') {
        return normalizeText(value).includes(normalizedQuery);
      }
      return false;
    });
  });
};