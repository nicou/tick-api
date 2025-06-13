import { z } from "zod/v4";
import { createHeaders, createUrl } from "./util";

export const User = z.object({
	id: z.number().describe("Unique identifier for the user"),
	first_name: z.string().describe("User's first name"),
	last_name: z.string().describe("User's last name"),
	email: z.email().describe("User's email address"),
	timezone: z.string().describe("User's timezone setting"),
	updated_at: z.string().describe("ISO 8601 timestamp when user was last modified"),
});
export type User = z.infer<typeof User>;

export const CreateUser = z.object({
	first_name: z.string().describe("User's first name"),
	last_name: z.string().describe("User's last name"),
	email: z.email().describe("User's email address"),
	admin: z.boolean().optional().describe("Whether user should have admin privileges"),
	billable_rate: z.string().optional().describe("User's billable rate as a string"),
});
export type CreateUserParams = z.infer<typeof CreateUser>;

/**
 * Get users on the subscription
 * Non-administrators will only see themselves, administrators will see everyone
 *
 * @returns Array of users
 * @see https://www.tickspot.com/{subscription_id}/api/v2/users.json
 */
export async function getUsers(): Promise<User[]> {
	const url = createUrl("users.json");

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return z.array(User).parse(data);
}

/**
 * Get deleted users who have time entries
 * Note: This method is restricted to administrators only
 *
 * @returns Array of deleted users
 * @see https://www.tickspot.com/{subscription_id}/api/v2/users/deleted.json
 */
export async function getDeletedUsers(): Promise<User[]> {
	const url = createUrl("users/deleted.json");

	const response = await fetch(url, {
		method: "GET",
		headers: createHeaders(false),
	});

	if (response.status === 403) {
		throw new Error("Forbidden: Only administrators can access deleted users");
	}

	if (!response.ok) {
		throw new Error(`Failed to fetch deleted users: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return z.array(User).parse(data);
}

/**
 * Create a new user
 * Note: This method is restricted to administrators only
 *
 * @param params User creation parameters
 * @returns The newly created user
 * @see https://www.tickspot.com/{subscription_id}/api/v2/users.json
 */
export async function createUser(params: CreateUserParams): Promise<User> {
	const url = createUrl("users.json");

	const response = await fetch(url, {
		method: "POST",
		headers: createHeaders(true),
		body: JSON.stringify({ user: params }),
	});

	if (response.status === 403) {
		throw new Error("Forbidden: Only administrators can create users");
	}

	if (!response.ok) {
		throw new Error(`Failed to create user: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return User.parse(data);
}
