# E2E Tests for TickSpot API

This directory contains end-to-end tests for the TickSpot API client that test against the real TickSpot API.

## Overview

The E2E tests are designed to:
- Test all **non-destructive** getter functions (no create, update, or delete operations)
- Validate the client works correctly with real API responses
- Test pagination, filtering, and edge cases
- Verify data consistency and relationships
- Ensure performance within reasonable limits

## Setup

### 1. Environment Configuration

Copy the example environment file and fill in your TickSpot credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```bash
# Your TickSpot subscription ID (found in your TickSpot URL)
TICK_SUBSCRIPTION_ID=your_subscription_id_here

# Your TickSpot API token (generate from your profile settings)
TICK_API_TOKEN=your_api_token_here

# User agent string for API requests (should include your email)
TICK_USER_AGENT=YourApp/1.0 (your.email@example.com)
```

### 2. How to Get Your Credentials

#### Subscription ID
- Log into your TickSpot account
- The subscription ID is in your URL: `https://www.tickspot.com/{subscription_id}/`

#### API Token
- Go to your TickSpot profile settings
- Navigate to the API section
- Generate a new API token

#### User Agent
- Use a descriptive name for your application
- Include your email address for support purposes
- Example: `MyTimeTracker/1.0 (john.doe@company.com)`

## Running the Tests

### Prerequisites

Make sure the project is built:
```bash
npm run build
```

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Specific Test Files
```bash
# Run all getter function tests
node --env-file=.env --test tests/e2e/all-getters.test.js

# Run performance and edge case tests
node --env-file=.env --test tests/e2e/performance.test.js

# Run all E2E tests directly
node --env-file=.env --test tests/e2e/
```

## Test Structure

### `all-getters.test.js`
Tests all the main getter functions:

**Users**
- `getUsers()` - Get all users (non-admin sees only themselves)
- `getDeletedUsers()` - Get deleted users (admin only)

**Clients**
- `getClients()` - Get active clients
- `getAllClients()` - Get all clients including archived
- `getClient(id)` - Get specific client details

**Projects**
- `getProjects()` - Get open projects
- `getClosedProjects()` - Get closed projects
- `getProject(id)` - Get specific project details

**Tasks**
- `getTasks()` - Get all open tasks
- `getClosedTasks()` - Get all closed tasks
- `getProjectTasks(projectId)` - Get tasks for specific project
- `getProjectClosedTasks(projectId)` - Get closed tasks for specific project
- `getTask(id)` - Get specific task details

**Entries**
- `getEntries(params)` - Get entries with date/filter parameters
- `getUserEntries(userId, params)` - Get entries for specific user
- `getProjectEntries(projectId, params)` - Get entries for specific project
- `getTaskEntries(taskId, params)` - Get entries for specific task
- `getEntry(id)` - Get specific entry details

### `performance.test.js`
Tests advanced scenarios:

**Pagination**
- Tests pagination for projects and closed projects
- Validates multiple pages work correctly

**Filtering**
- Tests various entry filters (billable, billed, project_id, etc.)
- Validates filter combinations work as expected

**Date Range Edge Cases**
- Tests with single day ranges
- Tests with long date ranges (1 year)
- Tests various `updated_at` timestamps

**Performance**
- Tests concurrent API calls
- Validates response times within reasonable limits

**Data Consistency**
- Validates relationships between projects and tasks
- Validates relationships between users and entries
- Validates relationships between entries and tasks

## What the Tests Don't Do

These E2E tests are **read-only** and **non-destructive**:

❌ **NOT TESTED** (destructive operations):
- Creating new clients, projects, tasks, or entries
- Updating existing resources
- Deleting resources
- Any operation that modifies data

✅ **TESTED** (safe read operations):
- All getter functions
- Filtering and pagination
- Data validation and relationships
- Error handling for invalid parameters

## Expected Behavior

### For Non-Admin Users
- `getUsers()` returns only the authenticated user
- `getDeletedUsers()` returns 403 Forbidden error (expected)
- All other functions work normally

### For Admin Users
- `getUsers()` returns all users in the subscription
- `getDeletedUsers()` returns deleted users with time entries
- All functions work with full access

### When No Data Exists
- Functions return empty arrays `[]` when no data matches the criteria
- This is normal and tests will pass with appropriate logging

## Troubleshooting

### Common Issues

**"Missing required environment variables"**
- Make sure `.env` file exists and contains all three required variables
- Check that variable names match exactly: `TICK_SUBSCRIPTION_ID`, `TICK_API_TOKEN`, `TICK_USER_AGENT`

**401 Unauthorized**
- Check that your API token is correct and active
- Verify your subscription ID is correct

**403 Forbidden for some functions**
- This is expected for non-admin users on admin-only endpoints
- Tests handle this gracefully and report it as informational

**No data found warnings**
- Tests may show "ℹ️ No [resource] available to test [function]" messages
- This is normal for new or empty TickSpot accounts
- Tests will still pass but with limited validation

### Debug Mode

To see more detailed output, run with verbose logging:
```bash
node --env-file=.env --test --test-reporter=verbose tests/e2e/
```

## Integration with CI/CD

These tests can be integrated into CI/CD pipelines, but require:
1. Secure storage of TickSpot credentials
2. A dedicated test TickSpot account (recommended)
3. Proper handling of admin vs non-admin test scenarios

Example for GitHub Actions:
```yaml
- name: Run E2E Tests
  env:
    TICK_SUBSCRIPTION_ID: ${{ secrets.TICK_SUBSCRIPTION_ID }}
    TICK_API_TOKEN: ${{ secrets.TICK_API_TOKEN }}
    TICK_USER_AGENT: ${{ secrets.TICK_USER_AGENT }}
  run: npm run test:e2e
```
