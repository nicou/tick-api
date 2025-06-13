#!/usr/bin/env node

// Tests for TickClient using Node.js built-in test runner
// 
// Run commands:
//   npm test                    - Run all tests
//   npm run test:client         - Run only client tests
//   npm run test:watch          - Run tests in watch mode
//   node --test tests/          - Run tests directly with Node.js

const { test, describe } = require('node:test');
const assert = require('node:assert');
const { TickClient } = require('../dist/index.js');

describe('TickClient', () => {
  test('should instantiate with valid configuration', () => {
    const client = new TickClient({
      subscriptionId: 'test123',
      apiToken: 'test-token',
      userAgent: 'TestApp (test@example.com)'
    });

    assert.ok(client, 'TickClient should be instantiated');
    assert.strictEqual(typeof client, 'object', 'TickClient should be an object');
  });

  test('should throw error when instantiated with invalid configuration', () => {
    // TickClient now validates configuration during instantiation
    assert.throws(
      () => new TickClient({}),
      (error) => {
        return error.message.includes('Invalid TickClient configuration') &&
               error.message.includes('subscriptionId is required') &&
               error.message.includes('apiToken is required') &&
               error.message.includes('userAgent is required');
      },
      'TickClient should throw error with empty config'
    );

    assert.throws(
      () => new TickClient({
        subscriptionId: 'test123'
      }),
      (error) => {
        return error.message.includes('Invalid TickClient configuration') &&
               error.message.includes('apiToken is required') &&
               error.message.includes('userAgent is required');
      },
      'TickClient should throw error with partial config'
    );

    assert.throws(
      () => new TickClient({
        apiToken: 'test-token'
      }),
      (error) => {
        return error.message.includes('Invalid TickClient configuration') &&
               error.message.includes('subscriptionId is required') &&
               error.message.includes('userAgent is required');
      },
      'TickClient should throw error with partial config'
    );

    // Test with empty strings
    assert.throws(
      () => new TickClient({
        subscriptionId: '',
        apiToken: '',
        userAgent: ''
      }),
      (error) => {
        return error.message.includes('Invalid TickClient configuration') &&
               error.message.includes('subscriptionId is required') &&
               error.message.includes('apiToken is required') &&
               error.message.includes('userAgent is required');
      },
      'TickClient should throw error with empty string values'
    );

    // Test with whitespace-only strings
    assert.throws(
      () => new TickClient({
        subscriptionId: '  ',
        apiToken: '\t',
        userAgent: '\n'
      }),
      (error) => {
        return error.message.includes('Invalid TickClient configuration') &&
               error.message.includes('subscriptionId is required') &&
               error.message.includes('apiToken is required') &&
               error.message.includes('userAgent is required');
      },
      'TickClient should throw error with whitespace-only values'
    );

    // Test with wrong types
    assert.throws(
      () => new TickClient({
        subscriptionId: 123,
        apiToken: true,
        userAgent: null
      }),
      (error) => {
        return error.message.includes('Invalid TickClient configuration') &&
               error.message.includes('subscriptionId is required') &&
               error.message.includes('apiToken is required') &&
               error.message.includes('userAgent is required');
      },
      'TickClient should throw error with wrong types'
    );
  });

  test('should have all required methods available', () => {
    const client = new TickClient({
      subscriptionId: 'test123',
      apiToken: 'test-token',
      userAgent: 'TestApp (test@example.com)'
    });

    // List all key methods that should exist
    const requiredMethods = [
      'getUsers', 'getProjects', 'getTasks', 'getEntries',
      'createEntry', 'updateEntry', 'deleteEntry',
      'createClient', 'createProject', 'createTask'
    ];

    requiredMethods.forEach(method => {
      assert.strictEqual(
        typeof client[method], 
        'function', 
        `${method} should be a function`
      );
    });
  });

  test('should provide proper error messages for specific validation failures', () => {
    // Test individual validation errors
    const testCases = [
      {
        config: { subscriptionId: '', apiToken: 'valid-token', userAgent: 'Valid Agent' },
        expectedError: 'subscriptionId is required'
      },
      {
        config: { subscriptionId: 'valid-id', apiToken: '', userAgent: 'Valid Agent' },
        expectedError: 'apiToken is required'
      },
      {
        config: { subscriptionId: 'valid-id', apiToken: 'valid-token', userAgent: '' },
        expectedError: 'userAgent is required'
      }
    ];

    testCases.forEach(({ config, expectedError }) => {
      assert.throws(
        () => new TickClient(config),
        (error) => error.message.includes(expectedError),
        `Should throw error containing "${expectedError}"`
      );
    });
  });

  test('should handle TypeScript types correctly', () => {
    // Test that configuration follows the expected TypeScript interface
    const config = {
      subscriptionId: 'test123',
      apiToken: 'test-token',  
      userAgent: 'TestApp (test@example.com)'
    };
    
    const client = new TickClient(config);
    assert.ok(client, 'TickClient should accept properly typed configuration');
  });

  test('should provide access to all API endpoints', () => {
    const client = new TickClient({
      subscriptionId: 'test123',
      apiToken: 'test-token',
      userAgent: 'TestApp (test@example.com)'
    });

    // Test user methods
    assert.strictEqual(typeof client.getUsers, 'function');
    assert.strictEqual(typeof client.getDeletedUsers, 'function');
    assert.strictEqual(typeof client.createUser, 'function');

    // Test client methods
    assert.strictEqual(typeof client.getClients, 'function');
    assert.strictEqual(typeof client.getAllClients, 'function');
    assert.strictEqual(typeof client.getClient, 'function');
    assert.strictEqual(typeof client.createClient, 'function');
    assert.strictEqual(typeof client.updateClient, 'function');
    assert.strictEqual(typeof client.deleteClient, 'function');

    // Test project methods
    assert.strictEqual(typeof client.getProjects, 'function');
    assert.strictEqual(typeof client.getClosedProjects, 'function');
    assert.strictEqual(typeof client.getProject, 'function');
    assert.strictEqual(typeof client.createProject, 'function');
    assert.strictEqual(typeof client.updateProject, 'function');
    assert.strictEqual(typeof client.deleteProject, 'function');

    // Test task methods
    assert.strictEqual(typeof client.getTasks, 'function');
    assert.strictEqual(typeof client.getProjectTasks, 'function');
    assert.strictEqual(typeof client.getClosedTasks, 'function');
    assert.strictEqual(typeof client.getProjectClosedTasks, 'function');
    assert.strictEqual(typeof client.getTask, 'function');
    assert.strictEqual(typeof client.createTask, 'function');
    assert.strictEqual(typeof client.updateTask, 'function');
    assert.strictEqual(typeof client.deleteTask, 'function');

    // Test entry methods
    assert.strictEqual(typeof client.getEntries, 'function');
    assert.strictEqual(typeof client.getUserEntries, 'function');
    assert.strictEqual(typeof client.getProjectEntries, 'function');
    assert.strictEqual(typeof client.getTaskEntries, 'function');
    assert.strictEqual(typeof client.getEntry, 'function');
    assert.strictEqual(typeof client.createEntry, 'function');
    assert.strictEqual(typeof client.updateEntry, 'function');
    assert.strictEqual(typeof client.deleteEntry, 'function');
  });
});
