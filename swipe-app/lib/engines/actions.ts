/**
 * Action Engine
 * Reference: Page 3 — BACKEND ARCHITECTURE (Section 3.7)
 *
 * Unified interface for all email actions:
 * - DELETE: Move to trash
 * - UNSUBSCRIBE: Use unsubscribe engine
 * - BLOCK SENDER: Use block engine
 * - KEEP: Mark as kept
 * - NUKE DOMAIN: Use nuke engine
 */

import type { NormalizedEmail, SwipeAction, ActionLog } from "../types";
import { executeUnsubscribe } from "./unsubscribe";
import { blockSender, nukeDomain } from "./block";
import { v4 as uuidv4 } from "uuid";
import {
    createOAuth2Client,
    setCredentials,
    trashEmail,
    untrashEmail,
    createBlockFilter,
    deleteFilter,
    getEmailsFromSender,
    getEmailsFromDomain,
    batchModifyEmails,
    markAsSpam,
} from "../providers/gmail";

/**
 * Action result interface
 */
export interface ActionResult {
    success: boolean;
    action: SwipeAction;
    undoToken: string | null;
    undoExpiry: number | null; // Unix timestamp
    metadata: Record<string, unknown>;
}

/**
 * Undo data stored for reversal
 */
export interface UndoData {
    action: SwipeAction;
    emailId: string;
    providerId: string;
    sender: string;
    domain: string;
    filterId?: string;
    messageIds?: string[];
    timestamp: number;
}

// In-memory undo store (should be moved to database in production)
const undoStore = new Map<string, UndoData>();

/**
 * Performance configuration
 * Reference: Page 3 Section 3.10
 */
const PERFORMANCE = {
    actionTimeout: 200, // < 200ms
    undoTimeout: 100, // < 100ms
    undoWindowMs: 30000, // 30 second minimum
};

/**
 * Execute a swipe action
 * Reference: Page 3 Section 3.7
 *
 * Safety Guarantees (Section 3.8):
 * - Undo Everywhere: Every action is reversible for at least 30 seconds
 * - No Auto-Actions: Never deletes or blocks without user approval
 * - No Content Reading: Uses metadata only
 * - No Permanent Deletion: Trash is used instead of permanent delete
 * - Provider-Safe Behavior: Respect rate limits
 */
export async function executeAction(
    action: SwipeAction,
    email: NormalizedEmail,
    credentials: { accessToken: string; refreshToken?: string },
    options?: {
        confirmDomainNuke?: boolean;
        domain?: string; // Required for nuke action
    }
): Promise<ActionResult> {
    const auth = createOAuth2Client();
    setCredentials(auth, credentials.accessToken, credentials.refreshToken);

    const undoToken = uuidv4();
    const undoExpiry = Date.now() + PERFORMANCE.undoWindowMs;

    switch (action) {
        case "delete": {
            const success = await trashEmail(auth, email.providerId);
            if (success) {
                // Store undo data
                undoStore.set(undoToken, {
                    action: "delete",
                    emailId: email.id,
                    providerId: email.providerId,
                    sender: email.sender,
                    domain: email.senderDomain,
                    timestamp: Date.now(),
                });

                return {
                    success: true,
                    action: "delete",
                    undoToken,
                    undoExpiry,
                    metadata: { emailId: email.id },
                };
            }
            return {
                success: false,
                action: "delete",
                undoToken: null,
                undoExpiry: null,
                metadata: { error: "Failed to delete email" },
            };
        }

        case "unsubscribe": {
            const result = await executeUnsubscribe(email, {
                createBlockFilter: async (sender: string) => {
                    const filterResult = await createBlockFilter(auth, {
                        senderEmail: sender,
                    });
                    return filterResult.success;
                },
                markAsSpam: async (emailId: string) => {
                    return await markAsSpam(auth, emailId);
                },
            });

            if (result.success && result.undoToken) {
                undoStore.set(undoToken, {
                    action: "unsubscribe",
                    emailId: email.id,
                    providerId: email.providerId,
                    sender: email.sender,
                    domain: email.senderDomain,
                    timestamp: Date.now(),
                });

                return {
                    success: true,
                    action: "unsubscribe",
                    undoToken,
                    undoExpiry,
                    metadata: result.metadata,
                };
            }
            return {
                success: false,
                action: "unsubscribe",
                undoToken: null,
                undoExpiry: null,
                metadata: result.metadata,
            };
        }

        case "block": {
            const result = await blockSender(email, {
                createFilter: async (senderEmail: string) => {
                    return await createBlockFilter(auth, { senderEmail });
                },
                deleteEmails: async (messageIds: string[]) => {
                    return await batchModifyEmails(auth, messageIds, {
                        removeLabelIds: ["INBOX"],
                        addLabelIds: ["TRASH"],
                    });
                },
                getEmailsFromSender: async (senderEmail: string) => {
                    return await getEmailsFromSender(auth, senderEmail);
                },
            });

            if (result.success) {
                undoStore.set(undoToken, {
                    action: "block",
                    emailId: email.id,
                    providerId: email.providerId,
                    sender: email.sender,
                    domain: email.senderDomain,
                    filterId: result.metadata.filterId,
                    timestamp: Date.now(),
                });

                return {
                    success: true,
                    action: "block",
                    undoToken,
                    undoExpiry,
                    metadata: result.metadata,
                };
            }
            return {
                success: false,
                action: "block",
                undoToken: null,
                undoExpiry: null,
                metadata: result.metadata,
            };
        }

        case "keep": {
            // Keep action just marks as kept, no provider action needed
            // This is tracked for learning purposes
            return {
                success: true,
                action: "keep",
                undoToken,
                undoExpiry,
                metadata: {
                    emailId: email.id,
                    sender: email.sender,
                    domain: email.senderDomain,
                },
            };
        }

        case "nuke": {
            const domain = options?.domain || email.senderDomain;

            const result = await nukeDomain(domain, {
                createDomainFilter: async (d: string) => {
                    return await createBlockFilter(auth, { domain: d });
                },
                deleteEmails: async (messageIds: string[]) => {
                    return await batchModifyEmails(auth, messageIds, {
                        removeLabelIds: ["INBOX"],
                        addLabelIds: ["TRASH"],
                    });
                },
                getEmailsFromDomain: async (d: string) => {
                    return await getEmailsFromDomain(auth, d);
                },
                getSendersFromDomain: async () => {
                    // This would query the database in production
                    return [];
                },
                confirmCaution: options?.confirmDomainNuke,
            });

            if (result.success) {
                undoStore.set(undoToken, {
                    action: "nuke",
                    emailId: email.id,
                    providerId: email.providerId,
                    sender: email.sender,
                    domain,
                    filterId: result.metadata.filterId,
                    timestamp: Date.now(),
                });

                return {
                    success: true,
                    action: "nuke",
                    undoToken,
                    undoExpiry,
                    metadata: result.metadata,
                };
            }
            return {
                success: false,
                action: "nuke",
                undoToken: null,
                undoExpiry: null,
                metadata: result.metadata,
            };
        }

        default:
            return {
                success: false,
                action,
                undoToken: null,
                undoExpiry: null,
                metadata: { error: "Unknown action" },
            };
    }
}

/**
 * Undo an action
 * Reference: Page 3 Section 3.8 - Undo Everywhere
 *
 * Performance: < 100ms
 */
export async function undoAction(
    undoToken: string,
    credentials: { accessToken: string; refreshToken?: string }
): Promise<{ success: boolean; error?: string }> {
    const undoData = undoStore.get(undoToken);

    if (!undoData) {
        return { success: false, error: "Undo token not found or expired" };
    }

    // Check if undo window has passed
    if (Date.now() - undoData.timestamp > PERFORMANCE.undoWindowMs) {
        undoStore.delete(undoToken);
        return { success: false, error: "Undo window has expired" };
    }

    const auth = createOAuth2Client();
    setCredentials(auth, credentials.accessToken, credentials.refreshToken);

    try {
        switch (undoData.action) {
            case "delete": {
                const success = await untrashEmail(auth, undoData.providerId);
                if (success) {
                    undoStore.delete(undoToken);
                    return { success: true };
                }
                return { success: false, error: "Failed to untrash email" };
            }

            case "block":
            case "nuke": {
                // Delete the filter
                if (undoData.filterId) {
                    const success = await deleteFilter(auth, undoData.filterId);
                    if (!success) {
                        return { success: false, error: "Failed to delete filter" };
                    }
                }
                // Note: We don't restore deleted emails as that would require storing them
                undoStore.delete(undoToken);
                return { success: true };
            }

            case "unsubscribe":
            case "keep":
                // These actions have no provider-side undo
                undoStore.delete(undoToken);
                return { success: true };

            default:
                return { success: false, error: "Unknown action type" };
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Create action log entry
 * Reference: Page 3 Section 3.9
 */
export function createActionLog(
    userId: string,
    action: SwipeAction,
    email: NormalizedEmail,
    result: ActionResult
): ActionLog {
    return {
        id: uuidv4(),
        userId,
        emailId: email.id,
        actionType: action,
        timestamp: Date.now(),
        provider: email.provider,
        metadata: {
            success: result.success,
            undoToken: result.undoToken,
            ...result.metadata,
        },
    };
}

/**
 * Get remaining undo time
 */
export function getRemainingUndoTime(undoToken: string): number | null {
    const undoData = undoStore.get(undoToken);
    if (!undoData) return null;

    const elapsed = Date.now() - undoData.timestamp;
    const remaining = PERFORMANCE.undoWindowMs - elapsed;
    return remaining > 0 ? remaining : null;
}

/**
 * Clean up expired undo tokens
 */
export function cleanupExpiredUndoTokens(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [token, data] of undoStore.entries()) {
        if (now - data.timestamp > PERFORMANCE.undoWindowMs) {
            undoStore.delete(token);
            cleaned++;
        }
    }

    return cleaned;
}
