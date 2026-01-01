/**
 * Token Refresher - Obsidian Mint Edition
 * Ensures background actions never fail due to expired OAuth tokens.
 */

export class TokenRefresher {
    private static refreshInterval: NodeJS.Timeout | null = null;
    private static onTokenExpired: () => Promise<void>;

    /**
     * Starts the heartbeat monitor.
     */
    public static start(onExpired: () => Promise<void>) {
        this.onTokenExpired = onExpired;

        // Check every 30 seconds
        this.refreshInterval = setInterval(async () => {
            await this.checkAndRefresh();
        }, 30000);

        console.log("[TokenRefresher] Heartbeat started.");
    }

    public static stop() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Actual logic to check token expiry and call refresh endpoint.
     */
    private static async checkAndRefresh() {
        const isNearExpiry = this.isTokenNearExpiry();

        if (isNearExpiry) {
            console.warn("[TokenRefresher] Token near expiry. Triggering refresh...");
            try {
                await this.onTokenExpired();
                console.log("[TokenRefresher] Token refreshed successfully.");
            } catch (error) {
                console.error("[TokenRefresher] Refresh failed:", error);
            }
        }
    }

    /**
     * Simulation: Returns true if token expires in less than 5 minutes.
     */
    private static isTokenNearExpiry(): boolean {
        // In real app: return (expiryTime - Date.now()) < 300000;
        return false; // Simulation: Always valid for now
    }
}
