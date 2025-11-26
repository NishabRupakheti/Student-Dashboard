# Testing Setup

## Test Database

The project uses a separate PostgreSQL database for testing that runs in a Docker container.

### Setup

1. Start the test database:
```bash
docker-compose up -d test-db
```

2. Run migrations on the test database (from inside the backend container):
```bash
npm run test:db:setup
```

### Running Tests

Inside the backend container:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Reset test database
npm run test:db:reset
```

### Test Database Details

- **Host**: `test-db` (inside Docker network)
- **Port**: `5432` (inside container)
- **User**: `test_user`
- **Password**: `test_password`
- **Database**: `TestDB`
- **Storage**: Uses tmpfs (in-memory) for faster tests

### Writing Tests

Tests are located in the `__tests__/` directory. Example:

```javascript
import { getTestPrismaClient } from '../lib/testDb.js';

describe('My Test Suite', () => {
  let prisma;

  beforeAll(() => {
    prisma = getTestPrismaClient();
  });

  test('my test case', async () => {
    // Your test code
  });
});
```

The test setup automatically:
- Connects to the test database before all tests
- Cleans all data between each test
- Disconnects after all tests complete
