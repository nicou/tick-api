Tick v2 API TS/JS Client
====================

Implements a TypeScript/JavaScript client for the Tick v2 API, providing a simple interface to interact with Tick's time tracking features. Implemented based on the [Tick v2 API documentation](https://github.com/tick/tick-api). Uses built-in fetch for HTTP requests, thus requiring Node.js 18+ or a compatible environment.

### Installation

```bash
npm install tick-api
```

### Quick Start

```typescript
import { TickClient } from 'tick-api';

const client = new TickClient({
  subscriptionId: 'your_subscription_id',
  apiToken: 'your_api_token',
  userAgent: 'MyCoolApp (me@example.com)',
});

// Get all users (will only return the current user's data if not admin)
const users = await client.getUsers();

// Get all projects
const projects = await client.getProjects();

// Create a new time entry
const entry = await client.createEntry({
  date: '2025-06-13',
  hours: 8,
  notes: 'Worked on project X',
  task_id: 123,
});
```

### Available Methods

The `TickClient` provides methods for the following API endpoints:

#### Users
- `getUsers()` - Get all users
- `getDeletedUsers()` - Get deleted users (admin only)
- `createUser(params)` - Create a new user (admin only)

#### Clients
- `getClients()` - Get active clients
- `getAllClients()` - Get all clients including archived
- `getClient(id)` - Get client details
- `createClient(params)` - Create new client (admin only)
- `updateClient(id, params)` - Update client (admin only)
- `deleteClient(id)` - Delete client (admin only)

#### Projects
- `getProjects(params?)` - Get open projects
- `getClosedProjects(params?)` - Get closed projects
- `getProject(id)` - Get project details
- `createProject(params)` - Create new project (admin only)
- `updateProject(id, params)` - Update project (admin only)
- `deleteProject(id)` - Delete project (admin only)

#### Tasks
- `getTasks()` - Get all open tasks
- `getProjectTasks(projectId)` - Get tasks for a project
- `getClosedTasks()` - Get all closed tasks
- `getProjectClosedTasks(projectId)` - Get closed tasks for a project
- `getTask(id)` - Get task details
- `createTask(params)` - Create new task (admin only)
- `updateTask(id, params)` - Update task (admin only)
- `deleteTask(id)` - Delete task (admin only)

#### Entries
- `getEntries(params)` - Get time entries
- `getUserEntries(userId, params)` - Get entries for a user
- `getProjectEntries(projectId, params)` - Get entries for a project
- `getTaskEntries(taskId, params)` - Get entries for a task
- `getEntry(id)` - Get entry details
- `createEntry(params)` - Create new entry
- `updateEntry(id, params)` - Update entry
- `deleteEntry(id)` - Delete entry
