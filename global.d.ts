// global.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string;
      RESEND_API_KEY:string;
      JWT_SECRET:string;
      ARBISCAN_API_KEY:string;
      EMAIL:string;
      EMAIL_PASS:string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
