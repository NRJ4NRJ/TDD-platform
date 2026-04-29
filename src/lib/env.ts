function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

export const env = {
  get supabaseUrl(): string { return getEnvVar("NEXT_PUBLIC_SUPABASE_URL"); },
  get supabaseAnonKey(): string { return getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"); },
};
