export const isServer = typeof window === 'undefined';
export const isClient = !isServer;
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = !isProduction;
export const isDevelopmentClient = isDevelopment && isClient;
