// global.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string;
      RESEND_API_KEY:string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
  
declare module 'react-checkmark'