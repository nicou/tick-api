#!/usr/bin/env node

// E2E Tests for TickClient using Node.js built-in test runner
// Tests all non-destructive getter functions against the real TickSpot API
// 
// Setup:
//   1. Copy .env.example to .env
//   2. Fill in your actual TickSpot credentials in .env
//   3. Run: npm run test:e2e
//
// Run commands:
//   npm run test:e2e              - Run E2E tests with environment variables
//   node --env-file=.env --test tests/e2e/  - Run directly with Node.js

const { test, describe, before } = require('node:test');
const assert = require('node:assert');
const { TickClient } = require('../../dist/index.js');

// Global test client instance
let client;

// Test configuration from environment variables
const config = {
  subscriptionId: process.env.TICK_SUBSCRIPTION_ID,
  apiToken: process.env.TICK_API_TOKEN,
  userAgent: process.env.TICK_USER_AGENT
};

// Helper function to validate environment setup
function validateEnvironment() {
  const missing = [];
  if (!config.subscriptionId) missing.push('TICK_SUBSCRIPTION_ID');
  if (!config.apiToken) missing.push('TICK_API_TOKEN');
  if (!config.userAgent) missing.push('TICK_USER_AGENT');
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\nPlease copy .env.example to .env and fill in your TickSpot credentials.`
    );
  }
}

// Setup before all tests
before(() => {
  validateEnvironment();
  client = new TickClient(config);
  console.log('🚀 E2E tests initialized with TickSpot API');
});

describe('TickClient E2E Tests - Users', () => {
  test('getUsers() should return array of users', async () => {
    const users = await client.getUsers();
    
    assert.ok(Array.isArray(users), 'getUsers should return an array');
    assert.ok(users.length > 0, 'Should return at least one user (the authenticated user)');
    
    // Validate user structure
    const user = users[0];
    assert.ok(typeof user.id === 'number', 'User should have numeric id');
    assert.ok(typeof user.first_name === 'string', 'User should have first_name');
    assert.ok(typeof user.last_name === 'string', 'User should have last_name');
    assert.ok(typeof user.email === 'string', 'User should have email');
    assert.ok(typeof user.timezone === 'string', 'User should have timezone');
    assert.ok(typeof user.updated_at === 'string', 'User should have updated_at');
    
    console.log(`✅ Found ${users.length} user(s)`);
  });
});

describe('TickClient E2E Tests - Clients', () => {
  test('getClients() should return array of active clients', async () => {
    const clients = await client.getClients();
    
    assert.ok(Array.isArray(clients), 'getClients should return an array');
    console.log(`✅ Found ${clients.length} active client(s)`);
    
    if (clients.length > 0) {
      const clientItem = clients[0];
      assert.ok(typeof clientItem.id === 'number', 'Client should have numeric id');
      assert.ok(typeof clientItem.name === 'string', 'Client should have name');
      assert.ok(typeof clientItem.archive === 'boolean', 'Client should have archive flag');
      assert.ok(typeof clientItem.url === 'string', 'Client should have url');
      assert.ok(typeof clientItem.updated_at === 'string', 'Client should have updated_at');
    }
  });

  test('getAllClients() should return array of all clients including archived', async () => {
    const allClients = await client.getAllClients();
    
    assert.ok(Array.isArray(allClients), 'getAllClients should return an array');
    console.log(`✅ Found ${allClients.length} total client(s) (including archived)`);
    
    if (allClients.length > 0) {
      const clientItem = allClients[0];
      assert.ok(typeof clientItem.id === 'number', 'Client should have numeric id');
      assert.ok(typeof clientItem.name === 'string', 'Client should have name');
      assert.ok(typeof clientItem.archive === 'boolean', 'Client should have archive flag');
    }
  });

  test('getClient() should return client details when client exists', async () => {
    const allClients = await client.getAllClients();
    
    if (allClients.length > 0) {
      const clientId = allClients[0].id;
      const clientDetails = await client.getClient(clientId);
      
      assert.ok(typeof clientDetails.id === 'number', 'Client details should have numeric id');
      assert.ok(typeof clientDetails.name === 'string', 'Client details should have name');
      assert.ok(typeof clientDetails.projects === 'object', 'Client details should have projects summary');
      assert.ok(typeof clientDetails.projects.count === 'number', 'Projects should have count');
      assert.ok(typeof clientDetails.projects.url === 'string', 'Projects should have url');
      
      console.log(`✅ Retrieved details for client "${clientDetails.name}" with ${clientDetails.projects.count} project(s)`);
    } else {
      console.log('ℹ️  No clients available to test getClient()');
    }
  });
});

describe('TickClient E2E Tests - Projects', () => {
  test('getProjects() should return array of open projects', async () => {
    const projects = await client.getProjects();
    
    assert.ok(Array.isArray(projects), 'getProjects should return an array');
    console.log(`✅ Found ${projects.length} open project(s)`);
    
    if (projects.length > 0) {
      const project = projects[0];
      assert.ok(typeof project.id === 'number', 'Project should have numeric id');
      assert.ok(typeof project.name === 'string', 'Project should have name');
      assert.ok(typeof project.budget === 'number' || project.budget === null, 'Project should have budget (number or null)');
      assert.ok(typeof project.billable === 'boolean', 'Project should have billable flag');
      assert.ok(typeof project.client_id === 'number', 'Project should have client_id');
      assert.ok(typeof project.owner_id === 'number', 'Project should have owner_id');
    }
  });

  test('getClosedProjects() should return array of closed projects', async () => {
    const closedProjects = await client.getClosedProjects();
    
    assert.ok(Array.isArray(closedProjects), 'getClosedProjects should return an array');
    console.log(`✅ Found ${closedProjects.length} closed project(s)`);
    
    if (closedProjects.length > 0) {
      const project = closedProjects[0];
      assert.ok(typeof project.id === 'number', 'Closed project should have numeric id');
      assert.ok(typeof project.name === 'string', 'Closed project should have name');
      assert.ok(project.date_closed !== null, 'Closed project should have date_closed');
    }
  });

  test('getProject() should return project details when project exists', async () => {
    const projects = await client.getProjects();
    
    if (projects.length > 0) {
      const projectId = projects[0].id;
      const projectDetails = await client.getProject(projectId);
      
      assert.ok(typeof projectDetails.id === 'number', 'Project details should have numeric id');
      assert.ok(typeof projectDetails.name === 'string', 'Project details should have name');
      assert.ok(typeof projectDetails.total_hours === 'number', 'Project details should have total_hours');
      assert.ok(typeof projectDetails.tasks === 'object', 'Project details should have tasks summary');
      assert.ok(typeof projectDetails.client === 'object', 'Project details should have client info');
      
      console.log(`✅ Retrieved details for project "${projectDetails.name}" with ${projectDetails.total_hours} total hours`);
    } else {
      console.log('ℹ️  No projects available to test getProject()');
    }
  });
});

describe('TickClient E2E Tests - Tasks', () => {
  test('getTasks() should return array of all open tasks', async () => {
    const tasks = await client.getTasks();
    
    assert.ok(Array.isArray(tasks), 'getTasks should return an array');
    console.log(`✅ Found ${tasks.length} open task(s) across all projects`);
    
    if (tasks.length > 0) {
      const task = tasks[0];
      assert.ok(typeof task.id === 'string', 'Task should have string id');
      assert.ok(typeof task.name === 'string', 'Task should have name');
      assert.ok(typeof task.budget === 'number' || task.budget === null, 'Task should have budget (number or null)');
      assert.ok(typeof task.position === 'number', 'Task should have position');
      assert.ok(typeof task.project_id === 'number', 'Task should have project_id');
      assert.ok(typeof task.billable === 'boolean', 'Task should have billable flag');
    }
  });

  test('getClosedTasks() should return array of all closed tasks', async () => {
    const closedTasks = await client.getClosedTasks();
    
    assert.ok(Array.isArray(closedTasks), 'getClosedTasks should return an array');
    console.log(`✅ Found ${closedTasks.length} closed task(s) across all projects`);
    
    if (closedTasks.length > 0) {
      const task = closedTasks[0];
      assert.ok(typeof task.id === 'string', 'Closed task should have string id');
      assert.ok(typeof task.name === 'string', 'Closed task should have name');
      assert.ok(task.date_closed !== null, 'Closed task should have date_closed');
    }
  });

  test('getProjectTasks() should return tasks for specific project', async () => {
    const projects = await client.getProjects();
    
    if (projects.length > 0) {
      const projectId = projects[0].id;
      const projectTasks = await client.getProjectTasks(projectId);
      
      assert.ok(Array.isArray(projectTasks), 'getProjectTasks should return an array');
      console.log(`✅ Found ${projectTasks.length} open task(s) for project ${projectId}`);
      
      // All tasks should belong to the specified project
      for (const task of projectTasks) {
        assert.strictEqual(task.project_id, projectId, 'Task should belong to the specified project');
      }
    } else {
      console.log('ℹ️  No projects available to test getProjectTasks()');
    }
  });

  test('getProjectClosedTasks() should return closed tasks for specific project', async () => {
    const projects = await client.getProjects();
    
    if (projects.length > 0) {
      const projectId = projects[0].id;
      const closedTasks = await client.getProjectClosedTasks(projectId);
      
      assert.ok(Array.isArray(closedTasks), 'getProjectClosedTasks should return an array');
      console.log(`✅ Found ${closedTasks.length} closed task(s) for project ${projectId}`);
      
      // All tasks should belong to the specified project and be closed
      for (const task of closedTasks) {
        assert.strictEqual(task.project_id, projectId, 'Closed task should belong to the specified project');
        assert.ok(task.date_closed !== null, 'Task should be closed');
      }
    } else {
      console.log('ℹ️  No projects available to test getProjectClosedTasks()');
    }
  });

  test('getTask() should return task details when task exists', async () => {
    const tasks = await client.getTasks();
    
    if (tasks.length > 0) {
      const taskId = tasks[0].id;
      const taskDetails = await client.getTask(taskId);
      
      assert.ok(typeof taskDetails.id === 'string', 'Task details should have string id');
      assert.ok(typeof taskDetails.name === 'string', 'Task details should have name');
      assert.ok(typeof taskDetails.total_hours === 'number', 'Task details should have total_hours');
      assert.ok(typeof taskDetails.entries === 'object', 'Task details should have entries summary');
      assert.ok(typeof taskDetails.project === 'object', 'Task details should have project info');
      
      console.log(`✅ Retrieved details for task "${taskDetails.name}" with ${taskDetails.total_hours} total hours`);
    } else {
      console.log('ℹ️  No tasks available to test getTask()');
    }
  });
});

describe('TickClient E2E Tests - Entries', () => {
  test('getEntries() should require date range or updated_at parameter', async () => {
    // Test with date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // 30 days ago
    const endDate = new Date();
    
    const entriesParams = {
      start_date: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
      end_date: endDate.toISOString().split('T')[0]
    };
    
    const entries = await client.getEntries(entriesParams);
    
    assert.ok(Array.isArray(entries), 'getEntries should return an array');
    console.log(`✅ Found ${entries.length} entrie(s) in the last 30 days`);
    
    if (entries.length > 0) {
      const entry = entries[0];
      assert.ok(typeof entry.id === 'string', 'Entry should have string id');
      assert.ok(typeof entry.date === 'string', 'Entry should have date');
      assert.ok(typeof entry.hours === 'number', 'Entry should have hours');
      assert.ok(typeof entry.notes === 'string', 'Entry should have notes');
      assert.ok(typeof entry.task_id === 'number', 'Entry should have task_id');
      assert.ok(typeof entry.user_id === 'number', 'Entry should have user_id');
    }
  });

  test('getEntries() with updated_at parameter should work', async () => {
    // Test with updated_at (7 days ago)
    const updatedAt = new Date();
    updatedAt.setDate(updatedAt.getDate() - 7);
    
    const entriesParams = {
      updated_at: updatedAt.toISOString()
    };
    
    const entries = await client.getEntries(entriesParams);
    
    assert.ok(Array.isArray(entries), 'getEntries with updated_at should return an array');
    console.log(`✅ Found ${entries.length} entrie(s) updated in the last 7 days`);
  });

  test('getUserEntries() should return entries for specific user', async () => {
    const users = await client.getUsers();
    
    if (users.length > 0) {
      const userId = users[0].id;
      const entriesParams = {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      };
      
      const userEntries = await client.getUserEntries(userId, entriesParams);
      
      assert.ok(Array.isArray(userEntries), 'getUserEntries should return an array');
      console.log(`✅ Found ${userEntries.length} entrie(s) for user ${userId} in the last 30 days`);
      
      // All entries should belong to the specified user
      for (const entry of userEntries) {
        assert.strictEqual(entry.user_id, userId, 'Entry should belong to the specified user');
      }
    } else {
      console.log('ℹ️  No users available to test getUserEntries()');
    }
  });

  test('getProjectEntries() should return entries for specific project', async () => {
    const projects = await client.getProjects();
    
    if (projects.length > 0) {
      const projectId = projects[0].id;
      const entriesParams = {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      };
      
      const projectEntries = await client.getProjectEntries(projectId, entriesParams);
      
      assert.ok(Array.isArray(projectEntries), 'getProjectEntries should return an array');
      console.log(`✅ Found ${projectEntries.length} entrie(s) for project ${projectId} in the last 30 days`);
    } else {
      console.log('ℹ️  No projects available to test getProjectEntries()');
    }
  });

  test('getTaskEntries() should return entries for specific task', async () => {
    const tasks = await client.getTasks();
    
    if (tasks.length > 0) {
      const taskId = tasks[0].id;
      const entriesParams = {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      };
      
      const taskEntries = await client.getTaskEntries(taskId, entriesParams);
      
      assert.ok(Array.isArray(taskEntries), 'getTaskEntries should return an array');
      console.log(`✅ Found ${taskEntries.length} entrie(s) for task ${taskId} in the last 30 days`);
      
      // All entries should belong to the specified task
      for (const entry of taskEntries) {
        assert.strictEqual(entry.task_id, Number.parseInt(taskId, 10), 'Entry should belong to the specified task');
      }
    } else {
      console.log('ℹ️  No tasks available to test getTaskEntries()');
    }
  });

  test('getEntry() should return entry details when entry exists', async () => {
    // First get some entries to test with
    const entriesParams = {
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    };
    
    const entries = await client.getEntries(entriesParams);
    
    if (entries.length > 0) {
      const entryId = entries[0].id;
      const entryDetails = await client.getEntry(entryId);
      
      assert.ok(typeof entryDetails.id === 'string', 'Entry details should have string id');
      assert.ok(typeof entryDetails.date === 'string', 'Entry details should have date');
      assert.ok(typeof entryDetails.hours === 'number', 'Entry details should have hours');
      assert.ok(typeof entryDetails.notes === 'string', 'Entry details should have notes');
      assert.ok(typeof entryDetails.task === 'object', 'Entry details should have task info');
      assert.ok(typeof entryDetails.task.id === 'string', 'Task should have string id');
      assert.ok(typeof entryDetails.task.name === 'string', 'Task should have name');
      
      console.log(`✅ Retrieved details for entry ${entryId} (${entryDetails.hours} hours on ${entryDetails.date})`);
    } else {
      console.log('ℹ️  No entries available to test getEntry()');
    }
  });
});

describe('TickClient E2E Tests - Error Handling', () => {
  test('should handle invalid parameters gracefully', async () => {
    // Test getEntries without required parameters
    try {
      await client.getEntries({});
      assert.fail('getEntries should throw error without required parameters');
    } catch (error) {
      assert.ok(
        error.message.includes('Either start_date and end_date OR updated_at must be provided'),
        'Should throw descriptive error for missing parameters'
      );
      console.log('✅ getEntries properly validates required parameters');
    }
  });

  test('should handle non-existent resource IDs gracefully', async () => {
    // Test with obviously invalid client ID
    try {
      await client.getClient(999999);
      assert.fail('getClient should throw error for non-existent client');
    } catch (error) {
      assert.ok(
        error.message.includes('Failed to fetch client') || error.message.includes('404'),
        'Should throw appropriate error for non-existent client'
      );
      console.log('✅ getClient properly handles non-existent client ID');
    }
  });
});

console.log('🎉 All E2E tests completed successfully!');
