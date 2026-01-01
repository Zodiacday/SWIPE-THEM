/**
 * Gmail Provider Adapter
 * Reference: Page 3 — BACKEND ARCHITECTURE (Section 3.3)
 * 
 * Handles all Gmail API interactions including:
 * - OAuth 2.0 authentication
 * - Email fetching with filters
 * - Message actions (trash, etc.)
 * - Filter creation for blocking
 */

import { google } from "googleapis";
import type { NormalizedEmail } from "../types";

const gmail = google.gmail("v1");

// OAuth scopes required
export const GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.labels",
    "https://www.googleapis.com/auth/gmail.settings.basic",
];

/**
 * Create OAuth2 client for Gmail API
 */
export function createOAuth2Client() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );
}

/**
 * Set credentials on OAuth2 client
 */
export function setCredentials(
    auth: ReturnType<typeof createOAuth2Client>,
    accessToken: string,
    refreshToken?: string
) {
    auth.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
    });
    return auth;
}

/**
 * Fetch emails from Gmail with filters
 * Reference: Page 3 Section 3.3 - Fetching Emails
 */
export async function fetchEmails(
    auth: ReturnType<typeof createOAuth2Client>,
    options: {
        maxResults?: number;
        pageToken?: string;
        query?: string;
        category?: "promotions" | "social" | "updates" | "forums" | "primary";
        unreadOnly?: boolean;
        afterDate?: Date;
    } = {}
): Promise<{ messages: string[]; nextPageToken?: string }> {
    const {
        maxResults = 100,
        pageToken,
        query = "",
        category,
        unreadOnly = false,
        afterDate,
    } = options;

    // Build query string
    let q = query;
    if (category) {
        q += ` category:${category}`;
    }
    if (unreadOnly) {
        q += " is:unread";
    }
    if (afterDate) {
        const dateStr = afterDate.toISOString().split("T")[0].replace(/-/g, "/");
        q += ` after:${dateStr}`;
    }

    const response = await gmail.users.messages.list({
        auth,
        userId: "me",
        maxResults,
        pageToken,
        q: q.trim(),
    });

    return {
        messages: response.data.messages?.map((m) => m.id!) || [],
        nextPageToken: response.data.nextPageToken || undefined,
    };
}

/**
 * Get email metadata
 * Reference: Page 3 Section 3.3 - Fetching Metadata
 */
export async function getEmailMetadata(
    auth: ReturnType<typeof createOAuth2Client>,
    messageId: string
): Promise<NormalizedEmail | null> {
    try {
        const response = await gmail.users.messages.get({
            auth,
            userId: "me",
            id: messageId,
            format: "metadata",
            metadataHeaders: [
                "From",
                "Subject",
                "Date",
                "List-Unsubscribe",
                "List-Unsubscribe-Post",
                "Precedence",
                "Return-Path",
                "X-Mailer",
                "X-Campaign-Id",
                "X-Newsletter",
                "X-List",
                "X-SG-EID",
                "X-Mailgun-Sid",
                "X-MC-User",
            ],
        });

        const { payload, labelIds, internalDate } = response.data;
        const headers = payload?.headers || [];

        // Helper to get header value
        const getHeader = (name: string): string | undefined => {
            return headers.find(
                (h) => h.name?.toLowerCase() === name.toLowerCase()
            )?.value ?? undefined;
        };

        // Parse From header
        const fromHeader = getHeader("From") || "";
        const senderMatch = fromHeader.match(/<([^>]+)>/);
        const sender = senderMatch ? senderMatch[1] : fromHeader.split(" ")[0];
        const senderName = fromHeader.replace(/<[^>]+>/, "").trim() || null;
        const senderDomain = sender.split("@")[1] || "";

        // Parse List-Unsubscribe header
        const listUnsubscribeHeader = getHeader("List-Unsubscribe") || "";
        const httpMatch = listUnsubscribeHeader.match(/<(https?:\/\/[^>]+)>/);
        const mailtoMatch = listUnsubscribeHeader.match(/<mailto:([^>]+)>/);

        // Determine category from labels
        let category: NormalizedEmail["category"] = "unknown";
        if (labelIds?.includes("CATEGORY_PROMOTIONS")) {
            category = "promo";
        } else if (labelIds?.includes("CATEGORY_SOCIAL")) {
            category = "social";
        } else if (labelIds?.includes("CATEGORY_UPDATES")) {
            category = "transactional";
        } else if (labelIds?.includes("CATEGORY_PERSONAL")) {
            category = "personal";
        }

        return {
            id: messageId,
            provider: "gmail",
            providerId: messageId,
            sender,
            senderName,
            senderDomain,
            subject: getHeader("Subject") || "(no subject)",
            timestamp: parseInt(internalDate || "0", 10),
            listUnsubscribe: {
                http: httpMatch?.[1] || null,
                mailto: mailtoMatch?.[1] || null,
            },
            category,
            labels: labelIds || [],
            metadata: {
                threadId: response.data.threadId,
                snippet: response.data.snippet,
            },
            headers: {
                precedence: getHeader("Precedence"),
                returnPath: getHeader("Return-Path"),
                xMailer: getHeader("X-Mailer"),
                xCampaign: getHeader("X-Campaign-Id"),
                xNewsletter: getHeader("X-Newsletter"),
                xList: getHeader("X-List"),
                xSgEid: getHeader("X-SG-EID"),
                xMailgunSid: getHeader("X-Mailgun-Sid"),
                xMailchimp: getHeader("X-MC-User"),
            },
        };
    } catch (error) {
        console.error(`Failed to get email metadata for ${messageId}:`, error);
        return null;
    }
}

/**
 * Batch get email metadata
 */
export async function batchGetEmailMetadata(
    auth: ReturnType<typeof createOAuth2Client>,
    messageIds: string[]
): Promise<NormalizedEmail[]> {
    // Process in batches of 50 to respect rate limits
    const batchSize = 50;
    const results: NormalizedEmail[] = [];

    for (let i = 0; i < messageIds.length; i += batchSize) {
        const batch = messageIds.slice(i, i + batchSize);
        const promises = batch.map((id) => getEmailMetadata(auth, id));
        const batchResults = await Promise.all(promises);

        for (const result of batchResults) {
            if (result) {
                results.push(result);
            }
        }

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < messageIds.length) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    return results;
}

/**
 * Move email to trash
 * Reference: Page 3 Section 3.3 - Deleting Emails
 */
export async function trashEmail(
    auth: ReturnType<typeof createOAuth2Client>,
    messageId: string
): Promise<boolean> {
    try {
        await gmail.users.messages.trash({
            auth,
            userId: "me",
            id: messageId,
        });
        return true;
    } catch (error) {
        console.error(`Failed to trash email ${messageId}:`, error);
        return false;
    }
}

/**
 * Untrash email (for undo)
 */
export async function untrashEmail(
    auth: ReturnType<typeof createOAuth2Client>,
    messageId: string
): Promise<boolean> {
    try {
        await gmail.users.messages.untrash({
            auth,
            userId: "me",
            id: messageId,
        });
        return true;
    } catch (error) {
        console.error(`Failed to untrash email ${messageId}:`, error);
        return false;
    }
}

/**
 * Batch modify emails (for bulk operations)
 * Reference: Page 6 Section 6.4 - Deleting Existing Emails
 */
export async function batchModifyEmails(
    auth: ReturnType<typeof createOAuth2Client>,
    messageIds: string[],
    options: {
        addLabelIds?: string[];
        removeLabelIds?: string[];
    }
): Promise<boolean> {
    try {
        await gmail.users.messages.batchModify({
            auth,
            userId: "me",
            requestBody: {
                ids: messageIds,
                addLabelIds: options.addLabelIds,
                removeLabelIds: options.removeLabelIds,
            },
        });
        return true;
    } catch (error) {
        console.error("Failed to batch modify emails:", error);
        return false;
    }
}

/**
 * Create Gmail filter for blocking
 * Reference: Page 3 Section 3.3 - Blocking Senders
 * Reference: Page 6 Section 6.4 - Gmail-Specific Behavior
 */
export async function createBlockFilter(
    auth: ReturnType<typeof createOAuth2Client>,
    options: {
        senderEmail?: string;
        domain?: string;
    }
): Promise<{ success: boolean; filterId?: string }> {
    try {
        const fromCriteria = options.domain
            ? `*@${options.domain}`
            : options.senderEmail;

        if (!fromCriteria) {
            return { success: false };
        }

        const response = await gmail.users.settings.filters.create({
            auth,
            userId: "me",
            requestBody: {
                criteria: {
                    from: fromCriteria,
                },
                action: {
                    removeLabelIds: ["INBOX"],
                    addLabelIds: ["TRASH"],
                },
            },
        });

        return {
            success: true,
            filterId: response.data.id || undefined,
        };
    } catch (error) {
        console.error("Failed to create block filter:", error);
        return { success: false };
    }
}

/**
 * Delete Gmail filter (for undo)
 */
export async function deleteFilter(
    auth: ReturnType<typeof createOAuth2Client>,
    filterId: string
): Promise<boolean> {
    try {
        await gmail.users.settings.filters.delete({
            auth,
            userId: "me",
            id: filterId,
        });
        return true;
    } catch (error) {
        console.error(`Failed to delete filter ${filterId}:`, error);
        return false;
    }
}

/**
 * Get all emails from a sender
 */
export async function getEmailsFromSender(
    auth: ReturnType<typeof createOAuth2Client>,
    senderEmail: string
): Promise<string[]> {
    const allMessages: string[] = [];
    let pageToken: string | undefined;

    do {
        const result = await fetchEmails(auth, {
            query: `from:${senderEmail}`,
            maxResults: 500,
            pageToken,
        });
        allMessages.push(...result.messages);
        pageToken = result.nextPageToken;
    } while (pageToken);

    return allMessages;
}

/**
 * Get all emails from a domain
 */
export async function getEmailsFromDomain(
    auth: ReturnType<typeof createOAuth2Client>,
    domain: string
): Promise<string[]> {
    const allMessages: string[] = [];
    let pageToken: string | undefined;

    do {
        const result = await fetchEmails(auth, {
            query: `from:@${domain}`,
            maxResults: 500,
            pageToken,
        });
        allMessages.push(...result.messages);
        pageToken = result.nextPageToken;
    } while (pageToken);

    return allMessages;
}

/**
 * Mark email as spam
 */
export async function markAsSpam(
    auth: ReturnType<typeof createOAuth2Client>,
    messageId: string
): Promise<boolean> {
    try {
        await gmail.users.messages.modify({
            auth,
            userId: "me",
            id: messageId,
            requestBody: {
                addLabelIds: ["SPAM"],
                removeLabelIds: ["INBOX"],
            },
        });
        return true;
    } catch (error) {
        console.error(`Failed to mark email as spam ${messageId}:`, error);
        return false;
    }
}
