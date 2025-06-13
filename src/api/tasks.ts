import { z } from "zod/v4";
import { createHeaders, createUrl } from "./util";

export const Task = z.object({
	id: z.string().describe("Unique identifier for the task"),
	name: z.string().describe("Task name or description"),
	budget: z.number().describe("Budgeted hours allocated for this task"),
	position: z.number().describe("Display order position of the task"),
	project_id: z.number().describe("ID of the project this task belongs to"),
	date_closed: z.string().nullable().describe("ISO 8601 date when task was closed, null if open"),
	billable: z.boolean().describe("Whether time logged to this task is billable"),
	url: z.string().describe("API URL for this specific task resource"),
	created_at: z.string().describe("ISO 8601 timestamp when task was created"),
	updated_at: z.string().describe("ISO 8601 timestamp when task was last modified"),
});
export type Task = z.infer<typeof Task>;

export const Project = z.object({
	id: z.number().describe("Unique identifier for the project"),
	name: z.string().describe("Project name or title"),
	budget: z.number().describe("Total budgeted hours for the project"),
	date_closed: z.string().nullable().describe("ISO 8601 date when project was closed, null if open"),
	notifications: z.boolean().describe("Whether notifications are enabled for this project"),
	billable: z.boolean().describe("Whether time logged to this project is billable"),
	recurring: z.boolean().describe("Whether this is a recurring project"),
	client_id: z.number().describe("ID of the client this project belongs to"),
	owner_id: z.number().describe("ID of the user who owns this project"),
	url: z.string().describe("API URL for this specific project resource"),
	created_at: z.string().describe("ISO 8601 timestamp when project was created"),
	updated_at: z.string().describe("ISO 8601 timestamp when project was last modified"),
});
export type Project = z.infer<typeof Project>;

export const EntriesSummary = z.object({
	count: z.number().describe("Number of time entries logged to this task"),
	url: z.string().describe("API URL to fetch task's time entries"),
	updated_at: z.string().describe("ISO 8601 timestamp when entries were last modified"),
});
export type EntriesSummary = z.infer<typeof EntriesSummary>;

export const TaskWithDetails = Task.extend({
	total_hours: z.number().describe("Total hours logged to this task"),
	entries: EntriesSummary,
	project: Project,
});
export type TaskWithDetails = z.infer<typeof TaskWithDetails>;

export const CreateTask = z.object({
	name: z.string().describe("Task name or description"),
	budget: z.number().describe("Budgeted hours to allocate for this task"),
	project_id: z.number().describe("ID of the project this task belongs to"),
	billable: z.boolean().describe("Whether time logged to this task is billable"),
});
export type CreateTaskParams = z.infer<typeof CreateTask>;

export const UpdateTask = z.object({
	name: z.string().optional().describe("Task name or description to update"),
	budget: z.number().optional().describe("Budgeted hours to update"),
	project_id: z.number().optional().describe("ID of project to reassign task to"),
	billable: z.boolean().optional().describe("Whether time logged to this task is billable"),
});
export type UpdateTaskParams = z.infer<typeof UpdateTask>;

/**
 * Get all opened tasks for a specific project
 *
 * @param projectId Project ID
 * @returns Array of opened tasks for the project
 * @see https://www.tickspot.com/{subscription_id}/api/v2/projects/{project_id}/tasks.json
 */
export async function getProjectTasks(projectId: number): Promise<Task[]> {
	const url = createUrl(`projects/${projectId}/tasks.json`);

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch tasks for project ${projectId}: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return z.array(Task).parse(data);
}

/**
 * Get all opened tasks across all projects
 *
 * @returns Array of all opened tasks
 * @see https://www.tickspot.com/{subscription_id}/api/v2/tasks.json
 */
export async function getTasks(): Promise<Task[]> {
	const url = createUrl("tasks.json");

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return z.array(Task).parse(data);
}

/**
 * Get all closed tasks for a specific project
 *
 * @param projectId Project ID
 * @returns Array of closed tasks for the project
 * @see https://www.tickspot.com/{subscription_id}/api/v2/projects/{project_id}/tasks/closed.json
 */
export async function getProjectClosedTasks(projectId: number): Promise<Task[]> {
	const url = createUrl(`projects/${projectId}/tasks/closed.json`);

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch closed tasks for project ${projectId}: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return z.array(Task).parse(data);
}

/**
 * Get all closed tasks across all projects
 *
 * @returns Array of all closed tasks
 * @see https://www.tickspot.com/{subscription_id}/api/v2/tasks/closed.json
 */
export async function getClosedTasks(): Promise<Task[]> {
	const url = createUrl("tasks/closed.json");

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch closed tasks: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return z.array(Task).parse(data);
}

/**
 * Get a specific task including total hours and entry information
 *
 * @param id Task ID
 * @returns Task details with additional information
 * @see https://www.tickspot.com/{subscription_id}/api/v2/tasks/{id}.json
 */
export async function getTask(id: string): Promise<TaskWithDetails> {
	const url = createUrl(`tasks/${id}.json`);

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch task with ID ${id}: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return TaskWithDetails.parse(data);
}

/**
 * Create a new task
 * Note: This method is limited strictly to administrators on the subscription
 *
 * @param params Task creation parameters
 * @returns The newly created task
 * @see https://www.tickspot.com/{subscription_id}/api/v2/tasks.json
 */
export async function createTask(params: CreateTaskParams): Promise<Task> {
	const url = createUrl("tasks.json");

	const response = await fetch(url, {
		method: "POST",
		headers: createHeaders(),
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		if (response.status === 403) {
			throw new Error("Failed to create task: Only administrators can create tasks");
		}
		throw new Error(`Failed to create task: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return Task.parse(data);
}

/**
 * Update an existing task
 * Note: This method is limited strictly to administrators on the subscription
 *
 * @param id Task ID to update
 * @param params Task update parameters
 * @returns The updated task
 * @see https://www.tickspot.com/{subscription_id}/api/v2/tasks/{id}.json
 */
export async function updateTask(id: string, params: UpdateTaskParams): Promise<Task> {
	const url = createUrl(`tasks/${id}.json`);

	const response = await fetch(url, {
		method: "PUT",
		headers: createHeaders(),
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		if (response.status === 403) {
			throw new Error("Failed to update task: Only administrators can update tasks");
		}
		throw new Error(`Failed to update task with ID ${id}: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return Task.parse(data);
}

/**
 * Delete a task
 * Note: This method is limited strictly to administrators on the subscription
 * Only tasks without any entries can be deleted
 *
 * @param id Task ID to delete
 * @returns Promise that resolves when deletion is successful
 * @see https://www.tickspot.com/{subscription_id}/api/v2/tasks/{id}.json
 */
export async function deleteTask(id: string): Promise<void> {
	const url = createUrl(`tasks/${id}.json`);

	const response = await fetch(url, {
		method: "DELETE",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		if (response.status === 403) {
			throw new Error("Failed to delete task: Only administrators can delete tasks");
		}
		if (response.status === 406) {
			throw new Error("Failed to delete task: Only tasks without any entries can be deleted");
		}
		throw new Error(`Failed to delete task with ID ${id}: ${response.status} ${response.statusText}`);
	}
}
