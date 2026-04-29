export const env = {
  get supabaseUrl(): string {
    const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!value) throw new Error("Variable d'environnement manquante : NEXT_PUBLIC_SUPABASE_URL");
    return value;
  },
  get supabaseAnonKey(): string {
    const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!value) throw new Error("Variable d'environnement manquante : NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return value;
  },
};
