export const BASE_URL = "https://www.tickspot.com";
export const API_VERSION = "v2";

export interface TickConfig {
	subscriptionId: string;
	apiToken: string;
	userAgent: string;
}

let globalConfig: TickConfig | null = null;

export function setGlobalConfig(config: TickConfig | null) {
	globalConfig = config;
}

export function getGlobalConfig(): TickConfig | null {
	return globalConfig;
}

/**
 * Creates headers for API requests, including authentication token
 * @param includeContentType Whether to include Content-Type header
 * @returns Headers object with authorization and content type
 */
export function createHeaders(includeContentType = true): HeadersInit {
	if (!globalConfig) {
		throw new Error("Global configuration is not set. Please call setGlobalConfig() first.");
	}

	const headers: HeadersInit = {
		Authorization: `Token token=${globalConfig.apiToken}`,
		"User-Agent": globalConfig.userAgent,
	};

	if (includeContentType) {
		headers["Content-Type"] = "application/json; charset=utf-8";
	}

	return headers;
}

/**
 * Constructs the API URL with the provided path
 * @param path Endpoint path to append to the base URL
 * @returns Complete API URL
 */
export function createUrl(path: string): string {
	if (!globalConfig) {
		throw new Error("Global configuration is not set. Please call setGlobalConfig() first.");
	}

	return `${BASE_URL}/${globalConfig.subscriptionId}/api/${API_VERSION}/${path}`;
}
