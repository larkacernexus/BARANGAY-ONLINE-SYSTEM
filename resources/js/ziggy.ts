import { Config } from 'ziggy-js';

// Default Ziggy configuration (will be overridden by server-side data)
export const Ziggy: Config = {
    url: 'http://localhost',
    port: null,
    defaults: {},
    routes: {},
} as Config;

// Declare global types
declare global {
    interface Window {
        Ziggy: Config;
        route: (name: string, params?: any, absolute?: boolean) => string;
    }
}