import { z } from "zod/v4";
import { createHeaders, createUrl } from "./util";

export const Entry = z.object({
	id: z.string().describe("Unique identifier for the time entry"),
	date: z.string().describe("Date the time was logged in YYYY-MM-DD format"),
	hours: z.number().describe("Number of hours logged for this entry"),
	notes: z.string().describe("Description or notes about the work performed"),
	task_id: z.number().describe("ID of the task this time was logged against"),
	user_id: z.number().describe("ID of the user who logged this time"),
	url: z.string().describe("API URL for this specific entry resource"),
	created_at: z.string().describe("ISO 8601 timestamp when entry was created"),
	updated_at: z.string().describe("ISO 8601 timestamp when entry was last modified"),
});
export type Entry = z.infer<typeof Entry>;

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

export const EntryWithTask = Entry.extend({
	task: Task,
});
export type EntryWithTask = z.infer<typeof EntryWithTask>;

export const CreateEntry = z.object({
	date: z.string().describe("Date to log time in YYYY-MM-DD format"),
	hours: z.number().describe("Number of hours to log"),
	notes: z.string().describe("Description or notes about the work performed"),
	task_id: z.number().describe("ID of the task to log time against"),
	user_id: z.number().optional().describe("ID of user (ignored if not admin)"),
});
export type CreateEntryParams = z.infer<typeof CreateEntry>;

export const UpdateEntry = z.object({
	date: z.string().optional().describe("Date to update entry to in YYYY-MM-DD format"),
	hours: z.number().optional().describe("Number of hours to update entry to"),
	notes: z.string().optional().describe("Description or notes to update"),
	task_id: z.number().optional().describe("ID of task to reassign entry to"),
	user_id: z.number().optional().describe("ID of user (ignored if not admin)"),
	billed: z.boolean().optional().describe("Whether this entry has been billed"),
});
export type UpdateEntryParams = z.infer<typeof UpdateEntry>;

export const GetEntries = z.object({
	start_date: z.string().optional().describe("Start date for filtering entries in YYYY-MM-DD format"),
	end_date: z.string().optional().describe("End date for filtering entries in YYYY-MM-DD format"),
	updated_at: z.string().optional().describe("Filter entries updated after this ISO 8601 timestamp"),
	billable: z.boolean().optional().describe("Filter entries by billable status"),
	project_id: z.number().optional().describe("Filter entries by project ID"),
	task_id: z.number().optional().describe("Filter entries by task ID"),
	user_id: z.number().optional().describe("Filter entries by user ID"),
	billed: z.boolean().optional().describe("Filter entries by billed status"),
});
export type GetEntriesParams = z.infer<typeof GetEntries>;

/**
 * Get entries that meet the provided parameters
 * Either start_date and end_date OR updated_at must be provided
 *
 * @param params Query parameters for filtering entries
 * @returns Array of entries
 * @see https://www.tickspot.com/{subscription_id}/api/v2/entries.json
 */
export async function getEntries(params: GetEntriesParams): Promise<Entry[]> {
	// Validate that either date range or updated_at is provided
	if ((!params.start_date || !params.end_date) && !params.updated_at) {
		throw new Error("Either start_date and end_date OR updated_at must be provided");
	}

	const queryParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			queryParams.append(key, String(value));
		}
	}

	const url = createUrl(`entries.json?${queryParams.toString()}`);

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch entries: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return z.array(Entry).parse(data);
}

/**
 * Get entries for a specific user
 *
 * @param userId User ID
 * @param params Query parameters for filtering entries
 * @returns Array of entries for the user
 * @see https://www.tickspot.com/{subscription_id}/api/v2/users/{user_id}/entries.json
 */
export async function getUserEntries(userId: number, params: GetEntriesParams): Promise<Entry[]> {
	// Validate that either date range or updated_at is provided
	if ((!params.start_date || !params.end_date) && !params.updated_at) {
		throw new Error("Either start_date and end_date OR updated_at must be provided");
	}

	const queryParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			queryParams.append(key, String(value));
		}
	}

	const url = createUrl(`users/${userId}/entries.json?${queryParams.toString()}`);

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch entries for user ${userId}: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return z.array(Entry).parse(data);
}

/**
 * Get entries for a specific project
 *
 * @param projectId Project ID
 * @param params Query parameters for filtering entries
 * @returns Array of entries for the project
 * @see https://www.tickspot.com/{subscription_id}/api/v2/projects/{project_id}/entries.json
 */
export async function getProjectEntries(projectId: number, params: GetEntriesParams): Promise<Entry[]> {
	// Validate that either date range or updated_at is provided
	if ((!params.start_date || !params.end_date) && !params.updated_at) {
		throw new Error("Either start_date and end_date OR updated_at must be provided");
	}

	const queryParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			queryParams.append(key, String(value));
		}
	}

	const url = createUrl(`projects/${projectId}/entries.json?${queryParams.toString()}`);

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch entries for project ${projectId}: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return z.array(Entry).parse(data);
}

/**
 * Get entries for a specific task
 *
 * @param taskId Task ID
 * @param params Query parameters for filtering entries
 * @returns Array of entries for the task
 * @see https://www.tickspot.com/{subscription_id}/api/v2/tasks/{task_id}/entries.json
 */
export async function getTaskEntries(taskId: number, params: GetEntriesParams): Promise<Entry[]> {
	// Validate that either date range or updated_at is provided
	if ((!params.start_date || !params.end_date) && !params.updated_at) {
		throw new Error("Either start_date and end_date OR updated_at must be provided");
	}

	const queryParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			queryParams.append(key, String(value));
		}
	}

	const url = createUrl(`tasks/${taskId}/entries.json?${queryParams.toString()}`);

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch entries for task ${taskId}: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return z.array(Entry).parse(data);
}

/**
 * Get a specific entry including task details
 *
 * @param id Entry ID
 * @returns Entry details with task information
 * @see https://www.tickspot.com/{subscription_id}/api/v2/entries/{id}.json
 */
export async function getEntry(id: string): Promise<EntryWithTask> {
	const url = createUrl(`entries/${id}.json`);

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch entry with ID ${id}: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return EntryWithTask.parse(data);
}

/**
 * Create a new entry
 * Note: user_id will be ignored if the user is not an administrator
 *
 * @param params Entry creation parameters
 * @returns The newly created entry
 * @see https://www.tickspot.com/{subscription_id}/api/v2/entries.json
 */
export async function createEntry(params: CreateEntryParams): Promise<Entry> {
	const url = createUrl("entries.json");

	const response = await fetch(url, {
		method: "POST",
		headers: createHeaders(),
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		throw new Error(`Failed to create entry: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return Entry.parse(data);
}

/**
 * Update an existing entry
 *
 * @param id Entry ID to update
 * @param params Entry update parameters
 * @returns The updated entry
 * @see https://www.tickspot.com/{subscription_id}/api/v2/entries/{id}.json
 */
export async function updateEntry(id: string, params: UpdateEntryParams): Promise<Entry> {
	const url = createUrl(`entries/${id}.json`);

	const response = await fetch(url, {
		method: "PUT",
		headers: createHeaders(),
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		throw new Error(`Failed to update entry with ID ${id}: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return Entry.parse(data);
}

/**
 * Delete an entry
 *
 * @param id Entry ID to delete
 * @returns Promise that resolves when deletion is successful
 * @see https://www.tickspot.com/{subscription_id}/api/v2/entries/{id}.json
 */
export async function deleteEntry(id: string): Promise<void> {
	const url = createUrl(`entries/${id}.json`);

	const response = await fetch(url, {
		method: "DELETE",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to delete entry with ID ${id}: ${response.status} ${response.statusText}`);
	}
}
