// Main exports
export { TickClient } from "./client";
export type { TickConfig } from "./api/util";

// Type exports from API modules
export { User, CreateUserParams } from "./api/users";

export {
	Client,
	ClientWithProjects,
	CreateClientParams,
	UpdateClientParams,
} from "./api/clients";

export {
	Project,
	ProjectWithDetails,
	CreateProjectParams,
	UpdateProjectParams,
	GetProjectsParams,
} from "./api/projects";

export {
	Task,
	TaskWithDetails,
	CreateTaskParams,
	UpdateTaskParams,
} from "./api/tasks";

export {
	Entry,
	EntryWithTask,
	CreateEntryParams,
	UpdateEntryParams,
	GetEntriesParams,
} from "./api/entries";
