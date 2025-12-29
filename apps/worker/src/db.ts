/// <reference types="@cloudflare/workers-types" />
export interface Env {
    DB: D1Database;
    FELICA_API_KEY: string;
    FELICA_BASE_URL: string;
    FELICA_MODEL: string;
}

export const getDb = (env: Env) => {
    return env.DB;
};
