import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up 4 levels from apps/api/src/config/env.ts to reach monorepo root
const monorepoRootEnv = path.resolve(__dirname, '../../../../.env.local');

dotenv.config({ path: monorepoRootEnv });
dotenv.config(); // Fallback to standard .env in CWD
