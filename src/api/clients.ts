import { z } from "zod/v4";
import { createHeaders, createUrl } from "./util";

export const Client = z.object({
	id: z.number().describe("Unique identifier for the client"),
	name: z.string().describe("Client company or organization name"),
	archive: z.boolean().describe("Whether the client is archived or active"),
	url: z.string().describe("API URL for this specific client resource"),
	updated_at: z.string().describe("ISO 8601 timestamp when client was last modified"),
});
export type Client = z.infer<typeof Client>;

export const ClientWithProjects = Client.extend({
	projects: z.object({
		count: z.number().describe("Number of projects for this client"),
		url: z.url().describe("API URL to fetch client's projects"),
		updated_at: z.string().describe("ISO 8601 timestamp when projects were last modified"),
	}),
});
export type ClientWithProjects = z.infer<typeof ClientWithProjects>;

export const CreateClient = z.object({
	name: z.string().describe("Client company or organization name"),
	archive: z.boolean().optional().describe("Whether to archive the client on creation"),
});
export type CreateClientParams = z.infer<typeof CreateClient>;

export const UpdateClientSchema = CreateClient;
export type UpdateClientParams = z.infer<typeof UpdateClientSchema>;

/**
 * Get all clients that have opened projects
 *
 * @returns Array of active clients
 * @see https://www.tickspot.com/{subscription_id}/api/v2/clients.json
 */
export async function getClients(): Promise<Client[]> {
	const url = createUrl("clients.json");

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch clients: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return z.array(Client).parse(data);
}

/**
 * Get all clients including archived ones
 *
 * @returns Array of all clients
 * @see https://www.tickspot.com/{subscription_id}/api/v2/clients/all.json
 */
export async function getAllClients(): Promise<Client[]> {
	const url = createUrl("clients/all.json");

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch all clients: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return z.array(Client).parse(data);
}

/**
 * Get detailed information about a specific client including project summary
 *
 * @param id Client ID
 * @returns Client details with project summary
 * @see https://www.tickspot.com/{subscription_id}/api/v2/clients/{id}.json
 */
export async function getClient(id: number): Promise<ClientWithProjects> {
	const url = createUrl(`clients/${id}.json`);

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch client with ID ${id}: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return ClientWithProjects.parse(data);
}

/**
 * Create a new client
 * Note: This method is restricted to administrators only
 *
 * @param params Client creation parameters
 * @returns The newly created client
 * @see https://www.tickspot.com/{subscription_id}/api/v2/clients.json
 */
export async function createClient(params: CreateClientParams): Promise<Client> {
	const url = createUrl("clients.json");

	const response = await fetch(url, {
		method: "POST",
		headers: createHeaders(),
		body: JSON.stringify(params),
	});

	if (response.status === 403) {
		throw new Error("Forbidden: Only administrators can create clients");
	}

	if (!response.ok) {
		throw new Error(`Failed to create client: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return Client.parse(data);
}

/**
 * Update an existing client
 * Note: This method is restricted to administrators only
 *
 * @param id Client ID to update
 * @param params Client update parameters
 * @returns The updated client
 * @see https://www.tickspot.com/{subscription_id}/api/v2/clients/{id}.json
 */
export async function updateClient(id: number, params: UpdateClientParams): Promise<Client> {
	const url = createUrl(`clients/${id}.json`);

	const response = await fetch(url, {
		method: "PUT",
		headers: createHeaders(),
		body: JSON.stringify(params),
	});

	if (response.status === 403) {
		throw new Error("Forbidden: Only administrators can update clients");
	}

	if (!response.ok) {
		throw new Error(`Failed to update client with ID ${id}: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return Client.parse(data);
}

/**
 * Delete a client
 * Note: This method is restricted to administrators only
 * Note: Only clients without any projects can be deleted
 *
 * @param id Client ID to delete
 * @returns Promise that resolves when deletion is successful
 * @throws Error if the client has associated projects (406 Not Acceptable)
 * @see https://www.tickspot.com/{subscription_id}/api/v2/clients/{id}.json
 */
export async function deleteClient(id: number): Promise<void> {
	const url = createUrl(`clients/${id}.json`);

	const response = await fetch(url, {
		method: "DELETE",
		headers: createHeaders(false),
	});

	if (response.status === 403) {
		throw new Error("Forbidden: Only administrators can delete clients");
	}

	if (response.status === 406) {
		throw new Error("Client cannot be deleted because it still has associated projects");
	}

	if (!response.ok) {
		throw new Error(`Failed to delete client with ID ${id}: ${response.status} ${response.statusText}`);
	}
}
