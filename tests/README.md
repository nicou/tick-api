# Test Suite

This directory contains tests for the Tick API client using Node.js built-in test runner.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run specific test file
```bash
npm run test:client
```

### Run tests directly with Node.js
```bash
node --test tests/test-client.js
```

## Test Coverage

### TickClient Tests (`test-client.js`)

- ✅ **Client Instantiation**: Verifies TickClient can be instantiated with valid configuration
- ✅ **Configuration Validation**: Tests that invalid configurations throw errors during instantiation
- ✅ **Method Availability**: Ensures all required API methods are available on the client
- ✅ **Validation Error Messages**: Confirms that specific validation errors provide helpful messages
- ✅ **TypeScript Compatibility**: Validates TypeScript type handling
- ✅ **Complete API Coverage**: Tests all endpoints are accessible

### API Methods Tested

The tests verify that all these methods are available:

#### Users API
- `getUsers()`, `getDeletedUsers()`, `createUser()`

#### Clients API  
- `getClients()`, `getAllClients()`, `getClient()`, `createClient()`, `updateClient()`, `deleteClient()`

#### Projects API
- `getProjects()`, `getClosedProjects()`, `getProject()`, `createProject()`, `updateProject()`, `deleteProject()`

#### Tasks API
- `getTasks()`, `getProjectTasks()`, `getClosedTasks()`, `getProjectClosedTasks()`, `getTask()`, `createTask()`, `updateTask()`, `deleteTask()`

#### Entries API
- `getEntries()`, `getUserEntries()`, `getProjectEntries()`, `getTaskEntries()`, `getEntry()`, `createEntry()`, `updateEntry()`, `deleteEntry()`

## Test Framework

Uses Node.js built-in test runner (available in Node.js 18+) with:
- `node:test` module for test structure
- `node:assert` module for assertions
- No external dependencies required
