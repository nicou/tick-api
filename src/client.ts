import * as clientsApi from "./api/clients";
import * as entriesApi from "./api/entries";
import * as projectsApi from "./api/projects";
import * as tasksApi from "./api/tasks";
import * as usersApi from "./api/users";
import { type TickConfig, getGlobalConfig, setGlobalConfig } from "./api/util";

export class TickClient {
	private config: TickConfig;

	constructor(config: TickConfig) {
		this.validateConfig(config);
		this.config = {
			subscriptionId: config.subscriptionId,
			apiToken: config.apiToken,
			userAgent: config.userAgent,
		};
	}

	private validateConfig(config: TickConfig): void {
		const errors: string[] = [];

		if (!config.subscriptionId || typeof config.subscriptionId !== "string" || config.subscriptionId.trim() === "") {
			errors.push("subscriptionId is required and must be a non-empty string");
		}

		if (!config.apiToken || typeof config.apiToken !== "string" || config.apiToken.trim() === "") {
			errors.push("apiToken is required and must be a non-empty string");
		}

		if (!config.userAgent || typeof config.userAgent !== "string" || config.userAgent.trim() === "") {
			errors.push("userAgent is required and must be a non-empty string");
		}

		if (errors.length > 0) {
			throw new Error(`Invalid TickClient configuration: ${errors.join(", ")}`);
		}
	}

	private async withConfig<T>(fn: () => Promise<T>): Promise<T> {
		const originalConfig = getGlobalConfig();
		setGlobalConfig(this.config);
		try {
			return await fn();
		} finally {
			setGlobalConfig(originalConfig);
		}
	}

	// Users API
	async getUsers() {
		return this.withConfig(() => usersApi.getUsers());
	}

	async getDeletedUsers() {
		return this.withConfig(() => usersApi.getDeletedUsers());
	}

	async createUser(params: usersApi.CreateUserParams) {
		return this.withConfig(() => usersApi.createUser(params));
	}

	// Clients API
	async getClients() {
		return this.withConfig(() => clientsApi.getClients());
	}

	async getAllClients() {
		return this.withConfig(() => clientsApi.getAllClients());
	}

	async getClient(id: number) {
		return this.withConfig(() => clientsApi.getClient(id));
	}

	async createClient(params: clientsApi.CreateClientParams) {
		return this.withConfig(() => clientsApi.createClient(params));
	}

	async updateClient(id: number, params: clientsApi.UpdateClientParams) {
		return this.withConfig(() => clientsApi.updateClient(id, params));
	}

	async deleteClient(id: number) {
		return this.withConfig(() => clientsApi.deleteClient(id));
	}

	// Projects API
	async getProjects(params?: projectsApi.GetProjectsParams) {
		return this.withConfig(() => projectsApi.getProjects(params));
	}

	async getClosedProjects(params?: projectsApi.GetProjectsParams) {
		return this.withConfig(() => projectsApi.getClosedProjects(params));
	}

	async getProject(id: number) {
		return this.withConfig(() => projectsApi.getProject(id));
	}

	async createProject(params: projectsApi.CreateProjectParams) {
		return this.withConfig(() => projectsApi.createProject(params));
	}

	async updateProject(id: number, params: projectsApi.UpdateProjectParams) {
		return this.withConfig(() => projectsApi.updateProject(id, params));
	}

	async deleteProject(id: number) {
		return this.withConfig(() => projectsApi.deleteProject(id));
	}

	// Tasks API
	async getTasks() {
		return this.withConfig(() => tasksApi.getTasks());
	}

	async getProjectTasks(projectId: number) {
		return this.withConfig(() => tasksApi.getProjectTasks(projectId));
	}

	async getClosedTasks() {
		return this.withConfig(() => tasksApi.getClosedTasks());
	}

	async getProjectClosedTasks(projectId: number) {
		return this.withConfig(() => tasksApi.getProjectClosedTasks(projectId));
	}

	async getTask(id: string) {
		return this.withConfig(() => tasksApi.getTask(id));
	}

	async createTask(params: tasksApi.CreateTaskParams) {
		return this.withConfig(() => tasksApi.createTask(params));
	}

	async updateTask(id: string, params: tasksApi.UpdateTaskParams) {
		return this.withConfig(() => tasksApi.updateTask(id, params));
	}

	async deleteTask(id: string) {
		return this.withConfig(() => tasksApi.deleteTask(id));
	}

	// Entries API
	async getEntries(params: entriesApi.GetEntriesParams) {
		return this.withConfig(() => entriesApi.getEntries(params));
	}

	async getUserEntries(userId: number, params: entriesApi.GetEntriesParams) {
		return this.withConfig(() => entriesApi.getUserEntries(userId, params));
	}

	async getProjectEntries(projectId: number, params: entriesApi.GetEntriesParams) {
		return this.withConfig(() => entriesApi.getProjectEntries(projectId, params));
	}

	async getTaskEntries(taskId: number, params: entriesApi.GetEntriesParams) {
		return this.withConfig(() => entriesApi.getTaskEntries(taskId, params));
	}

	async getEntry(id: string) {
		return this.withConfig(() => entriesApi.getEntry(id));
	}

	async createEntry(params: entriesApi.CreateEntryParams) {
		return this.withConfig(() => entriesApi.createEntry(params));
	}

	async updateEntry(id: string, params: entriesApi.UpdateEntryParams) {
		return this.withConfig(() => entriesApi.updateEntry(id, params));
	}

	async deleteEntry(id: string) {
		return this.withConfig(() => entriesApi.deleteEntry(id));
	}
}
