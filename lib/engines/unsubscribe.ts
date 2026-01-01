/**
 * Unsubscribe Engine
 * Reference: Page 5 — UNSUBSCRIBE ENGINE
 *
 * Handles unsubscription via HTTP, mailto, and provider-specific methods.
 */

import type { NormalizedEmail, UnsubscribeResult } from "../types";
import { canBlockSender, getDomainSafetyCategory } from "../detection/newsletter";
import { v4 as uuidv4 } from "uuid";

/**
 * Suspicious unsubscribe link patterns
 */
const SUSPICIOUS_PATTERNS = [
    /track\./i,
    /redirect\./i,
    /click\./i,
    /bit\.ly/i,
    /t\.co/i,
    /goo\.gl/i,
    /tinyurl/i,
    /ow\.ly/i,
];

/**
 * Check if unsubscribe link is suspicious
 * Reference: Page 5 Section 5.3 Step 1
 */
function isSuspiciousLink(url: string): boolean {
    for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(url)) {
            return true;
        }
    }
    return false;
}

/**
 * Check safety before unsubscribing
 * Reference: Page 5 Section 5.3 Step 1 & Section 5.5
 */
export function checkUnsubscribeSafety(
    email: NormalizedEmail
): { safe: boolean; requiresConfirmation: boolean; reason?: string } {
    const blockCheck = canBlockSender(email);

    // If can't block, definitely can't unsubscribe
    if (!blockCheck.allowed) {
        return { safe: false, requiresConfirmation: false, reason: blockCheck.reason };
    }

    // Check for suspicious unsubscribe link
    if (email.listUnsubscribe.http && isSuspiciousLink(email.listUnsubscribe.http)) {
        return {
            safe: true,
            requiresConfirmation: true,
            reason: "Unsubscribe link looks suspicious. Please confirm.",
        };
    }

    // Check domain safety
    const domainSafety = getDomainSafetyCategory(email.senderDomain);
    if (domainSafety === "caution") {
        return {
            safe: true,
            requiresConfirmation: true,
            reason: "This sender is from a domain that may send important emails.",
        };
    }

    return { safe: true, requiresConfirmation: false };
}

/**
 * Perform HTTP unsubscribe
 * Reference: Page 5 Section 5.3 Step 2
 */
async function httpUnsubscribe(
    url: string,
    retryCount = 0
): Promise<{ success: boolean; error?: string }> {
    // Enforce HTTPS only
    if (!url.startsWith("https://")) {
        return { success: false, error: "Only HTTPS unsubscribe links are supported" };
    }

    try {
        // Try GET first
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            },
            redirect: "follow",
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Success criteria: 200 OK, 204 No Content, or successful redirect
        if (response.ok || response.status === 204) {
            return { success: true };
        }

        // Try POST if GET fails
        if (response.status === 405 || response.status === 400) {
            const postResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "unsubscribe=true",
                redirect: "follow",
            });

            if (postResponse.ok || postResponse.status === 204) {
                return { success: true };
            }
        }

        // Retry once on failure
        if (retryCount === 0) {
            await new Promise((r) => setTimeout(r, 500));
            return httpUnsubscribe(url, 1);
        }

        return { success: false, error: `HTTP error: ${response.status}` };
    } catch (error) {
        if (retryCount === 0) {
            await new Promise((r) => setTimeout(r, 500));
            return httpUnsubscribe(url, 1);
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Send mailto unsubscribe
 * Reference: Page 5 Section 5.3 Step 3
 *
 * Note: This requires server-side email sending capability.
 * For MVP, we'll just prepare the mailto data.
 */
export function prepareMailtoUnsubscribe(
    mailtoAddress: string
): { to: string; subject: string; body: string } {
    // Parse mailto address (might include subject/body params)
    let to = mailtoAddress;
    let subject = "unsubscribe";
    let body = "unsubscribe";

    try {
        const url = new URL(`mailto:${mailtoAddress}`);
        to = url.pathname;
        const params = new URLSearchParams(url.search);
        if (params.get("subject")) subject = params.get("subject")!;
        if (params.get("body")) body = params.get("body")!;
    } catch {
        // Use defaults
    }

    return { to, subject, body };
}

/**
 * Execute unsubscribe action
 * Reference: Page 5 — UNSUBSCRIBE ENGINE
 *
 * Execution Flow (Section 5.3):
 * 1. Check safety rules
 * 2. Try HTTP unsubscribe (preferred)
 * 3. Try mailto unsubscribe (fallback)
 * 4. Try provider-specific unsubscribe
 * 5. Fallback to block sender
 */
export async function executeUnsubscribe(
    email: NormalizedEmail,
    options?: {
        confirmUnsafe?: boolean;
        sendMailto?: (to: string, subject: string, body: string) => Promise<boolean>;
        createBlockFilter?: (sender: string) => Promise<boolean>;
        markAsSpam?: (emailId: string) => Promise<boolean>;
    }
): Promise<UnsubscribeResult> {
    const undoToken = uuidv4();

    // Step 1: Check safety
    const safetyCheck = checkUnsubscribeSafety(email);
    if (!safetyCheck.safe) {
        return {
            success: false,
            method: "http",
            fallbackUsed: false,
            undoToken: null,
            metadata: { error: safetyCheck.reason },
        };
    }

    if (safetyCheck.requiresConfirmation && !options?.confirmUnsafe) {
        return {
            success: false,
            method: "http",
            fallbackUsed: false,
            undoToken: null,
            metadata: { requiresConfirmation: true, reason: safetyCheck.reason },
        };
    }

    // Step 2: Try HTTP unsubscribe
    if (email.listUnsubscribe.http) {
        const httpResult = await httpUnsubscribe(email.listUnsubscribe.http);
        if (httpResult.success) {
            return {
                success: true,
                method: "http",
                fallbackUsed: false,
                undoToken,
                metadata: { url: email.listUnsubscribe.http },
            };
        }
    }

    // Step 3: Try mailto unsubscribe
    if (email.listUnsubscribe.mailto && options?.sendMailto) {
        const mailtoData = prepareMailtoUnsubscribe(email.listUnsubscribe.mailto);
        const mailtoSuccess = await options.sendMailto(
            mailtoData.to,
            mailtoData.subject,
            mailtoData.body
        );
        if (mailtoSuccess) {
            return {
                success: true,
                method: "mailto",
                fallbackUsed: false,
                undoToken,
                metadata: { mailto: email.listUnsubscribe.mailto },
            };
        }
    }

    // Step 5: Fallback - Block sender
    if (options?.createBlockFilter) {
        const blockSuccess = await options.createBlockFilter(email.sender);
        if (blockSuccess) {
            return {
                success: true,
                method: "block",
                fallbackUsed: true,
                undoToken,
                metadata: { sender: email.sender },
            };
        }
    }

    // Final fallback - Mark as spam
    if (options?.markAsSpam) {
        const spamSuccess = await options.markAsSpam(email.id);
        if (spamSuccess) {
            return {
                success: true,
                method: "spam",
                fallbackUsed: true,
                undoToken,
                metadata: { emailId: email.id },
            };
        }
    }

    return {
        success: false,
        method: "http",
        fallbackUsed: true,
        undoToken: null,
        metadata: { error: "All unsubscribe methods failed" },
    };
}
