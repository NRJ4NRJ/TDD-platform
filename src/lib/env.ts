function require(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

export const env = {
  supabaseUrl: require("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: require("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
};
