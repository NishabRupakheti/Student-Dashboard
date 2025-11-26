import { setupTestDb, teardownTestDb, cleanupTestDb } from './lib/testDb.js';

beforeAll(async () => {
  await setupTestDb();
});

beforeEach(async () => {
  await cleanupTestDb();
});

afterAll(async () => {
  await teardownTestDb();
});
