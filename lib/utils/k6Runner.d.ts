// lib/utils/k6Runner.d.ts
export function generateK6Script(
  scriptContent: string,
  scriptType?: string
): string;
export async function runK6Script(scriptPath: string): Promise<string>;
