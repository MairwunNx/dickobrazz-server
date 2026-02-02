import YAML from "yaml";

export const expand = (text: string): unknown => {
  const expandedText = text.replace(/\$\{([A-Z0-9_]+)(?::-(.*?))?\}/gi, (_match, varName: string, fallback?: string) => {
    const value = process.env[varName];
    if (value !== undefined) return value;
    if (fallback !== undefined) return fallback;
    throw new Error(`ENV var "${varName}" is not set`);
  });

  return YAML.parse(expandedText);
};
