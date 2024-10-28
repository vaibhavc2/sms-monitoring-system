export function capitalizeTrimName(name: string): string {
  return name.toUpperCase().replace(/\s+/g, '_');
}
