// Minimal process.env declaration for Next.js projects without local node_modules
declare const process: {
  env: {
    readonly NEXT_PUBLIC_SUPABASE_URL?: string;
    readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    readonly NEXT_PUBLIC_SITE_URL?: string;
    readonly [key: string]: string | undefined;
  };
};
