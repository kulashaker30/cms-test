// Force test env
process.env.NODE_ENV = 'test';

// Use a dedicated test DB (adjust as needed)
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST
    || 'postgresql://postgres:postgres@localhost:5432/cms?schema=public';

// JWT + Prisma engine suitable for Windows
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';

// Some Next/undici bits rely on WHATWG URL in Node
import 'whatwg-url';
