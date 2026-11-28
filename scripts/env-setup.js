import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

for (const name of ['.env.test', '.env']) {
  const path = fileURLToPath(new URL(`../${name}`, import.meta.url));
  if (existsSync(path)) {
    const result = dotenv.config({ path });
    if (result.error) throw result.error;
  }
}

export const testMongoUrl = process.env.TEST_MONGO_URL || process.env.MONGO_URL || process.env.MONGO_URI;
