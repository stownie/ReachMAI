// Type declarations for Vite configuration
declare module 'vite' {
  export interface UserConfig {
    plugins?: any[];
    [key: string]: any;
  }
  export function defineConfig(config: UserConfig): UserConfig;
}

declare module '@vitejs/plugin-react' {
  function react(options?: any): any;
  export default react;
}

// Basic Node.js types for vite config
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};