/**
 * Block & Domain Nuke Engine
 * Reference: Page 6 — BLOCK & DOMAIN NUKE ENGINE
 *
 * Handles blocking senders and nuking domains.
 */

import type { NormalizedEmail, BlockResult } from "../types";
import { canBlockSender, canNukeDomain, getDomainSafetyCategory } from "../detection/newsletter";
import { v4 as uuidv4 } from "uuid";

/**
 * Block sender result metadata
 */
interface BlockMetadata {
    sender: string;
    domain: string;
    filterId?: string;
    emailsDeleted: number;
}

/**
 * Domain nuke result metadata
 */
interface NukeMetadata {
    domain: string;
    sendersBlocked: number;
    emailsDeleted: number;
    filterId?: string;
}

/**
 * Execute block sender action
 * Reference: Page 6 Section 6.2 - Block Sender Logic
 *
 * Block Flow:
 * 1. Identify sender email
 * 2. Extract domain
 * 3. Check safety rules
 * 4. Execute provider-specific block
 * 5. Delete existing emails
 * 6. Create persistent rule
 * 7. Log action
 * 8. Provide undo token
 */
export async function blockSender(
    email: NormalizedEmail,
    options: {
        createFilter: (senderEmail: string) => Promise<{ success: boolean; filterId?: string }>;
        deleteEmails: (messageIds: string[]) => Promise<boolean>;
        getEmailsFromSender: (senderEmail: string) => Promise<string[]>;
        confirmUnsafe?: boolean;
    }
): Promise<BlockResult & { metadata: BlockMetadata }> {
    const undoToken = uuidv4();

    // Step 3: Check safety rules
    const safetyCheck = canBlockSender(email);
    if (!safetyCheck.allowed) {
        return {
            success: false,
            action: "block",
            undoToken: null,
            metadata: {
                sender: email.sender,
                domain: email.senderDomain,
                emailsDeleted: 0,
            },
        };
    }

    // Step 4: Create filter to block future emails
    const filterResult = await options.createFilter(email.sender);
    if (!filterResult.success) {
        return {
            success: false,
            action: "block",
            undoToken: null,
            metadata: {
                sender: email.sender,
                domain: email.senderDomain,
                emailsDeleted: 0,
            },
        };
    }

    // Step 5: Delete existing emails from sender
    const existingEmails = await options.getEmailsFromSender(email.sender);
    let emailsDeleted = 0;
    if (existingEmails.length > 0) {
        const deleteSuccess = await options.deleteEmails(existingEmails);
        if (deleteSuccess) {
            emailsDeleted = existingEmails.length;
        }
    }

    return {
        success: true,
        action: "block",
        undoToken,
        metadata: {
            sender: email.sender,
            domain: email.senderDomain,
            filterId: filterResult.filterId,
            emailsDeleted,
        },
    };
}

/**
 * Execute domain nuke action
 * Reference: Page 6 Section 6.3 - Domain Nuke Logic
 *
 * Domain Nuke Flow:
 * 1. Extract domain
 * 2. Check domain safety
 * 3. Identify all senders from domain
 * 4. Delete all emails from domain
 * 5. Create domain-level block rule
 * 6. Log action
 * 7. Provide undo token
 */
export async function nukeDomain(
    domain: string,
    options: {
        createDomainFilter: (domain: string) => Promise<{ success: boolean; filterId?: string }>;
        deleteEmails: (messageIds: string[]) => Promise<boolean>;
        getEmailsFromDomain: (domain: string) => Promise<string[]>;
        getSendersFromDomain: (domain: string) => Promise<string[]>;
        confirmCaution?: boolean;
    }
): Promise<BlockResult & { metadata: NukeMetadata }> {
    const undoToken = uuidv4();

    // Step 2: Check domain safety
    const safetyCheck = canNukeDomain(domain);
    if (!safetyCheck.allowed) {
        return {
            success: false,
            action: "domain_nuke",
            undoToken: null,
            metadata: {
                domain,
                sendersBlocked: 0,
                emailsDeleted: 0,
            },
        };
    }

    if (safetyCheck.requiresConfirmation && !options.confirmCaution) {
        return {
            success: false,
            action: "domain_nuke",
            undoToken: null,
            metadata: {
                domain,
                sendersBlocked: 0,
                emailsDeleted: 0,
            },
        };
    }

    // Step 3: Identify all senders from domain
    const senders = await options.getSendersFromDomain(domain);

    // Step 4: Delete all emails from domain
    const existingEmails = await options.getEmailsFromDomain(domain);
    let emailsDeleted = 0;
    if (existingEmails.length > 0) {
        const deleteSuccess = await options.deleteEmails(existingEmails);
        if (deleteSuccess) {
            emailsDeleted = existingEmails.length;
        }
    }

    // Step 5: Create domain-level block filter
    const filterResult = await options.createDomainFilter(domain);
    if (!filterResult.success) {
        return {
            success: false,
            action: "domain_nuke",
            undoToken: null,
            metadata: {
                domain,
                sendersBlocked: senders.length,
                emailsDeleted,
            },
        };
    }

    return {
        success: true,
        action: "domain_nuke",
        undoToken,
        metadata: {
            domain,
            sendersBlocked: senders.length,
            emailsDeleted,
            filterId: filterResult.filterId,
        },
    };
}

/**
 * Get domain safety info
 */
export function getDomainSafetyInfo(domain: string): {
    category: "safe_to_nuke" | "caution" | "never_nuke" | "unknown";
    canBlock: boolean;
    requiresConfirmation: boolean;
    message?: string;
} {
    const category = getDomainSafetyCategory(domain);
    const nukeCheck = canNukeDomain(domain);

    return {
        category,
        canBlock: nukeCheck.allowed,
        requiresConfirmation: nukeCheck.requiresConfirmation,
        message: nukeCheck.reason,
    };
}
