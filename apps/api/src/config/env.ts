import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up 4 levels from apps/api/src/config/env.ts to reach monorepo root
const monorepoRootEnv = path.resolve(__dirname, '../../../../.env.local');

const result1 = dotenv.config({ path: monorepoRootEnv });
if (result1.error) {
  console.log(`[env] monorepoRootEnv loaded failed: ${result1.error.message}`);
} else {
  console.log(`[env] monorepoRootEnv loaded successfully.`);
}

const result2 = dotenv.config(); // Fallback to standard .env in CWD
if (result2.error) {
  console.log(`[env] fallback .env loaded failed: ${result2.error.message}`);
} else {
  console.log(`[env] fallback .env loaded successfully.`);
}
