/// <reference types="vite/client" />

declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*.mp3' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_GEMINI_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

