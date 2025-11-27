import { setupTestDb, teardownTestDb, cleanupTestDb } from './lib/testDb.js';

beforeAll(async () => { // this runs once before all tests
  await setupTestDb();
});

beforeEach(async () => { // this runs before each test  
  await cleanupTestDb();
});

afterAll(async () => { // this runs once after all tests
  await teardownTestDb();
});
