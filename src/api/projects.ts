import { z } from "zod/v4";
import { createHeaders, createUrl } from "./util";

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

export const ProjectClient = z.object({
	id: z.number().describe("Unique identifier for the client"),
	name: z.string().describe("Client company or organization name"),
	archive: z.boolean().describe("Whether the client is archived or active"),
	url: z.string().describe("API URL for this specific client resource"),
	updated_at: z.string().describe("ISO 8601 timestamp when client was last modified"),
});
export type ProjectClient = z.infer<typeof ProjectClient>;

export const ProjectWithDetails = Project.extend({
	total_hours: z.number().describe("Total hours logged to this project"),
	tasks: z.object({
		count: z.number().describe("Number of tasks in this project"),
		url: z.string().describe("API URL to fetch project's tasks"),
		updated_at: z.string().nullable().describe("ISO 8601 timestamp when tasks were last modified"),
	}),
	client: ProjectClient,
});
export type ProjectWithDetails = z.infer<typeof ProjectWithDetails>;

export const CreateProject = z.object({
	name: z.string().describe("Project name or title"),
	budget: z.number().describe("Total budgeted hours for the project"),
	notifications: z.boolean().describe("Whether to enable notifications for this project"),
	billable: z.boolean().describe("Whether time logged to this project is billable"),
	recurring: z.boolean().describe("Whether this is a recurring project"),
	client_id: z.number().describe("ID of the client this project belongs to"),
	owner_id: z.number().describe("ID of the user who will own this project"),
});
export type CreateProjectParams = z.infer<typeof CreateProject>;

export const UpdateProject = z.object({
	name: z.string().optional().describe("Project name or title to update"),
	budget: z.number().optional().describe("Total budgeted hours to update"),
	notifications: z.boolean().optional().describe("Whether to enable notifications"),
	billable: z.boolean().optional().describe("Whether time logged is billable"),
	recurring: z.boolean().optional().describe("Whether this is a recurring project"),
	client_id: z.number().optional().describe("ID of client to reassign project to"),
	owner_id: z.number().optional().describe("ID of user to assign as project owner"),
});
export type UpdateProjectParams = z.infer<typeof UpdateProject>;

export interface GetProjectsParams {
	page?: number;
}

/**
 * Get opened projects
 * Supports pagination with up to 100 records per page
 *
 * @param params Query parameters including optional page number
 * @returns Array of opened projects
 * @see https://www.tickspot.com/{subscription_id}/api/v2/projects.json
 */
export async function getProjects(params: GetProjectsParams = {}): Promise<Project[]> {
	const queryParams = new URLSearchParams();
	if (params.page) {
		queryParams.append("page", String(params.page));
	}

	const queryString = queryParams.toString();
	const url = createUrl(queryString ? `projects.json?${queryString}` : "projects.json");

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return z.array(Project).parse(data);
}

/**
 * Get closed projects
 * Supports pagination with up to 100 records per page
 *
 * @param params Query parameters including optional page number
 * @returns Array of closed projects
 * @see https://www.tickspot.com/{subscription_id}/api/v2/projects/closed.json
 */
export async function getClosedProjects(params: GetProjectsParams = {}): Promise<Project[]> {
	const queryParams = new URLSearchParams();
	if (params.page) {
		queryParams.append("page", String(params.page));
	}

	const queryString = queryParams.toString();
	const url = createUrl(queryString ? `projects/closed.json?${queryString}` : "projects/closed.json");

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch closed projects: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return z.array(Project).parse(data);
}

/**
 * Get detailed information about a specific project
 * Includes total hours, task summary, and client information
 *
 * @param id Project ID
 * @returns Project details with additional information
 * @see https://www.tickspot.com/{subscription_id}/api/v2/projects/{id}.json
 */
export async function getProject(id: number): Promise<ProjectWithDetails> {
	const url = createUrl(`projects/${id}.json`);

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch project with ID ${id}: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return ProjectWithDetails.parse(data);
}

/**
 * Create a new project
 * Note: This method is restricted to administrators only
 * Note: No tasks will be created, time entries not allowed until at least one task is created
 *
 * @param params Project creation parameters
 * @returns The newly created project
 * @see https://www.tickspot.com/{subscription_id}/api/v2/projects.json
 */
export async function createProject(params: CreateProjectParams): Promise<Project> {
	const url = createUrl("projects.json");

	const response = await fetch(url, {
		method: "POST",
		headers: createHeaders(),
		body: JSON.stringify({ project: params }),
	});

	if (response.status === 403) {
		throw new Error("Forbidden: Only administrators can create projects");
	}

	if (!response.ok) {
		throw new Error(`Failed to create project: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return Project.parse(data);
}

/**
 * Update an existing project
 * Note: This method is restricted to administrators only
 *
 * @param id Project ID to update
 * @param params Project update parameters
 * @returns The updated project
 * @see https://www.tickspot.com/{subscription_id}/api/v2/projects/{id}.json
 */
export async function updateProject(id: number, params: UpdateProjectParams): Promise<Project> {
	const url = createUrl(`projects/${id}.json`);

	const response = await fetch(url, {
		method: "PUT",
		headers: createHeaders(),
		body: JSON.stringify({ project: params }),
	});

	if (response.status === 403) {
		throw new Error("Forbidden: Only administrators can update projects");
	}

	if (!response.ok) {
		throw new Error(`Failed to update project with ID ${id}: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return Project.parse(data);
}

/**
 * Delete a project
 * Note: This method is restricted to administrators only
 * WARNING: The project and ALL time entries will be immediately deleted
 *
 * @param id Project ID to delete
 * @returns Promise that resolves when deletion is successful
 * @see https://www.tickspot.com/{subscription_id}/api/v2/projects/{id}.json
 */
export async function deleteProject(id: number): Promise<void> {
	const url = createUrl(`projects/${id}.json`);

	const response = await fetch(url, {
		method: "DELETE",
		headers: createHeaders(false),
	});

	if (response.status === 403) {
		throw new Error("Forbidden: Only administrators can delete projects");
	}

	if (!response.ok) {
		throw new Error(`Failed to delete project with ID ${id}: ${response.status} ${response.statusText}`);
	}
}
