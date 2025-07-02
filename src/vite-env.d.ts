/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Declaração para o objeto global eapps do Elfsight
interface Window {
  eapps?: {
    reinit?: () => void;
    [key: string]: any;
  };
}