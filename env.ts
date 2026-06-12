const stripWrappingQuotes = (value: string) => {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

export const readEnv = (name: string, fallback = '') => {
  const rawValue = process.env[name];
  if (typeof rawValue !== 'string') return fallback;

  const normalized = stripWrappingQuotes(rawValue);
  return normalized || fallback;
};
