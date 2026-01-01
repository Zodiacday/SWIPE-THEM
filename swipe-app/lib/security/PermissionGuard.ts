/**
 * Permission Guard - Obsidian Mint Edition
 * Ensures users have granted the required OAuth scopes.
 */

export type RequiredScope =
    | "https://www.googleapis.com/auth/gmail.readonly"
    | "https://www.googleapis.com/auth/gmail.modify"
    | "https://www.googleapis.com/auth/gmail.labels";

export interface PermissionStatus {
    granted: RequiredScope[];
    missing: RequiredScope[];
    isFullyAuthorized: boolean;
}

const REQUIRED_SCOPES: RequiredScope[] = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.labels"
];

export class PermissionGuard {
    /**
     * Checks if the session has all required permissions.
     * In a real app, this would inspect the JWT or call an introspection endpoint.
     */
    public static async verifyPermissions(grantedScopes: string[]): Promise<PermissionStatus> {
        const grantedSet = new Set(grantedScopes);
        const missing = REQUIRED_SCOPES.filter(scope => !grantedSet.has(scope));

        return {
            granted: REQUIRED_SCOPES.filter(scope => grantedSet.has(scope)),
            missing,
            isFullyAuthorized: missing.length === 0
        };
    }

    /**
     * Simulated check for Demo mode.
     * Toggle this to true to bypass checks during local development.
     */
    public static getDemoStatus(): PermissionStatus {
        return {
            granted: [...REQUIRED_SCOPES],
            missing: [],
            isFullyAuthorized: true
        };
    }
}
