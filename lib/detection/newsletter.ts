/**
 * Newsletter Detection Engine
 * Reference: Page 4 — NEWSLETTER DETECTION ENGINE
 *
 * Implements deterministic rules and heuristic scoring to classify emails.
 */

import type { NormalizedEmail, DetectionResult } from "../types";
import { DOMAIN_SAFETY } from "../types";

/**
 * Marketing sender domain patterns
 * Reference: Page 4 Section 4.3 - Rule 3
 */
const MARKETING_DOMAINS = [
    "mailchimp.com",
    "sendgrid.net",
    "mailgun.org",
    "constantcontact.com",
    "substack.com",
    "campaignmonitor.com",
    "convertkit.com",
    "klaviyo.com",
    "mailerlite.com",
    "sendinblue.com",
    "drip.com",
    "beehiiv.com",
    "getresponse.com",
    "activecampaign.com",
    "aweber.com",
    "mailjet.com",
    "sparkpost.com",
    "postmarkapp.com",
    "mandrill.com",
    "sailthru.com",
    "braze.com",
    "iterable.com",
    "customer.io",
    "intercom.com",
];

/**
 * Transactional sender patterns
 * Reference: Page 4 Section 4.10 - Safety Rules
 */
const TRANSACTIONAL_PATTERNS = [
    "noreply",
    "no-reply",
    "do-not-reply",
    "donotreply",
    "receipt",
    "order",
    "invoice",
    "confirmation",
    "shipping",
    "tracking",
    "security",
    "verify",
    "verification",
    "password",
    "reset",
    "account",
    "billing",
    "payment",
    "support",
    "help",
    "service",
];

/**
 * Personal sender detection heuristics
 */
function isLikelyPersonalSender(email: NormalizedEmail): boolean {
    const { sender, senderName, senderDomain } = email;

    // Check for common free email providers (likely personal)
    const personalDomains = [
        "gmail.com",
        "yahoo.com",
        "hotmail.com",
        "outlook.com",
        "icloud.com",
        "aol.com",
        "protonmail.com",
        "zoho.com",
        "fastmail.com",
    ];

    if (personalDomains.includes(senderDomain.toLowerCase())) {
        // Check if it looks like a personal name email
        const localPart = sender.split("@")[0];
        // Personal emails often have dots or underscores separating name parts
        if (/^[a-z]+[._][a-z]+$/i.test(localPart)) {
            return true;
        }
    }

    // Check if sender name looks like a real person (First Last pattern)
    if (senderName) {
        const nameMatch = senderName.match(/^([A-Z][a-z]+)\s+([A-Z][a-z]+)$/);
        if (nameMatch) {
            return true;
        }
    }

    return false;
}

/**
 * Check if email is transactional
 * Reference: Page 4 Section 4.10 - Safety Rules
 */
function isTransactional(email: NormalizedEmail): boolean {
    const { sender, subject } = email;
    const lowerSender = sender.toLowerCase();
    const lowerSubject = subject.toLowerCase();

    // Check sender patterns
    for (const pattern of TRANSACTIONAL_PATTERNS) {
        if (lowerSender.includes(pattern)) {
            return true;
        }
    }

    // Check subject patterns
    const transactionalSubjectPatterns = [
        "order confirmation",
        "shipping confirmation",
        "your receipt",
        "your order",
        "password reset",
        "verify your",
        "confirm your",
        "security alert",
        "login attempt",
        "payment received",
        "invoice",
        "statement",
        "appointment",
        "reservation",
        "booking confirmation",
        "flight",
        "itinerary",
    ];

    for (const pattern of transactionalSubjectPatterns) {
        if (lowerSubject.includes(pattern)) {
            return true;
        }
    }

    return false;
}

/**
 * Rule 1: List-Unsubscribe header detection
 * Reference: Page 4 Section 4.3
 * Confidence: 1.0
 */
function checkListUnsubscribe(email: NormalizedEmail): number {
    if (email.listUnsubscribe.http || email.listUnsubscribe.mailto) {
        return 1.0;
    }
    return 0;
}

/**
 * Rule 2: Gmail category detection
 * Reference: Page 4 Section 4.3
 * Confidence: 0.95
 */
function checkProviderCategory(email: NormalizedEmail): number {
    const { labels } = email;

    if (
        labels.includes("CATEGORY_PROMOTIONS") ||
        labels.includes("CATEGORY_SOCIAL")
    ) {
        return 0.95;
    }

    if (labels.includes("CATEGORY_UPDATES")) {
        return 0.5; // Might be transactional
    }

    return 0;
}

/**
 * Rule 3: Sender domain pattern matching
 * Reference: Page 4 Section 4.3
 * Confidence: 0.9
 */
function checkSenderDomain(email: NormalizedEmail): number {
    const { senderDomain, headers } = email;
    const lowerDomain = senderDomain.toLowerCase();

    // Check if domain is a known marketing platform
    for (const marketingDomain of MARKETING_DOMAINS) {
        if (lowerDomain.includes(marketingDomain)) {
            return 0.9;
        }
    }

    // Check Return-Path for marketing domains
    if (headers.returnPath) {
        const returnPathDomain = headers.returnPath
            .split("@")[1]
            ?.toLowerCase()
            ?.replace(">", "");
        for (const marketingDomain of MARKETING_DOMAINS) {
            if (returnPathDomain?.includes(marketingDomain)) {
                return 0.85;
            }
        }
    }

    return 0;
}

/**
 * Header analysis
 * Reference: Page 4 Section 4.4
 */
function analyzeHeaders(email: NormalizedEmail): number {
    const { headers } = email;
    let score = 0;

    // Precedence: bulk
    if (headers.precedence?.toLowerCase() === "bulk") {
        score = Math.max(score, 0.8);
    }

    // X-Mailer contains "campaign"
    if (headers.xMailer?.toLowerCase().includes("campaign")) {
        score = Math.max(score, 0.7);
    }

    // X-List exists
    if (headers.xList) {
        score = Math.max(score, 0.75);
    }

    // X-Campaign exists
    if (headers.xCampaign) {
        score = Math.max(score, 0.8);
    }

    // X-Newsletter exists
    if (headers.xNewsletter) {
        score = Math.max(score, 0.9);
    }

    // SendGrid header
    if (headers.xSgEid) {
        score = Math.max(score, 0.75);
    }

    // Mailgun header
    if (headers.xMailgunSid) {
        score = Math.max(score, 0.75);
    }

    // Mailchimp header
    if (headers.xMailchimp) {
        score = Math.max(score, 0.85);
    }

    return score;
}

/**
 * Detect newsletter/promo/social emails
 * Reference: Page 4 — NEWSLETTER DETECTION ENGINE
 *
 * Detection Pipeline (Section 4.2):
 * 1. Provider category detection
 * 2. Header analysis
 * 3. List-Unsubscribe detection
 * 4. Sender reputation lookup
 * 5. Frequency analysis
 * 6. HTML metadata parsing (not implemented - metadata only)
 * 7. Heuristic scoring
 * 8. Final classification
 */
export function detectNewsletter(
    email: NormalizedEmail,
    senderStats?: { frequencyScore: number; reputationScore: number }
): DetectionResult {
    // Safety check: Transactional emails
    if (isTransactional(email)) {
        return {
            type: "transactional",
            confidence: 0.9,
            signals: {
                listUnsubscribe: false,
                senderReputation: 0,
                providerCategory: email.category,
                frequencyScore: 0,
                htmlSignals: 0,
                headerSignals: 0,
            },
        };
    }

    // Safety check: Personal senders
    if (isLikelyPersonalSender(email)) {
        return {
            type: "personal",
            confidence: 0.8,
            signals: {
                listUnsubscribe: false,
                senderReputation: 0,
                providerCategory: email.category,
                frequencyScore: 0,
                htmlSignals: 0,
                headerSignals: 0,
            },
        };
    }

    // Calculate signals
    const listUnsubscribeScore = checkListUnsubscribe(email);
    const providerCategoryScore = checkProviderCategory(email);
    const senderDomainScore = checkSenderDomain(email);
    const headerScore = analyzeHeaders(email);
    const frequencyScore = senderStats?.frequencyScore || 0;
    const reputationScore = senderStats?.reputationScore || 0.5;

    // Weighted scoring (Section 4.8)
    // List-Unsubscribe: 0.35
    // Sender domain reputation: 0.25
    // Gmail/Outlook category: 0.20
    // Frequency: 0.10
    // HTML metadata: 0.05 (not used - metadata only)
    // Header patterns: 0.05
    const finalScore =
        listUnsubscribeScore * 0.35 +
        Math.max(reputationScore, senderDomainScore) * 0.25 +
        providerCategoryScore * 0.2 +
        frequencyScore * 0.1 +
        0 * 0.05 + // HTML metadata not used
        headerScore * 0.05;

    // Classification thresholds (Section 4.8)
    let type: DetectionResult["type"] = "unknown";
    if (finalScore >= 0.75) {
        type = "newsletter";
    } else if (finalScore >= 0.5) {
        type = "promo";
    } else if (finalScore >= 0.3) {
        type = "social";
    }

    // Override based on Gmail category if strong signal
    if (email.labels.includes("CATEGORY_PROMOTIONS") && type === "unknown") {
        type = "promo";
    } else if (email.labels.includes("CATEGORY_SOCIAL") && type === "unknown") {
        type = "social";
    }

    return {
        type,
        confidence: Math.min(finalScore, 1),
        signals: {
            listUnsubscribe: listUnsubscribeScore > 0,
            senderReputation: reputationScore,
            providerCategory: email.category,
            frequencyScore,
            htmlSignals: 0,
            headerSignals: headerScore,
        },
    };
}

/**
 * Batch detect newsletters
 * Performance requirement: < 5ms per 100 emails (Section 4.11)
 */
export function batchDetectNewsletters(
    emails: NormalizedEmail[],
    senderStatsMap?: Map<string, { frequencyScore: number; reputationScore: number }>
): Map<string, DetectionResult> {
    const results = new Map<string, DetectionResult>();

    for (const email of emails) {
        const senderStats = senderStatsMap?.get(email.sender);
        results.set(email.id, detectNewsletter(email, senderStats));
    }

    return results;
}

/**
 * Check if domain is safe to nuke
 * Reference: Page 6 Section 6.6
 */
export function getDomainSafetyCategory(
    domain: string
): "safe_to_nuke" | "caution" | "never_nuke" | "unknown" {
    const lowerDomain = domain.toLowerCase();

    // Check never nuke
    for (const neverNukeDomain of DOMAIN_SAFETY.neverNuke) {
        if (lowerDomain === neverNukeDomain || lowerDomain.endsWith(`.${neverNukeDomain}`)) {
            return "never_nuke";
        }
    }

    // Check caution
    for (const cautionDomain of DOMAIN_SAFETY.caution) {
        if (lowerDomain === cautionDomain || lowerDomain.endsWith(`.${cautionDomain}`)) {
            return "caution";
        }
    }

    // Check safe to nuke
    for (const safeDomain of DOMAIN_SAFETY.safeToNuke) {
        if (lowerDomain === safeDomain || lowerDomain.endsWith(`.${safeDomain}`)) {
            return "safe_to_nuke";
        }
    }

    return "unknown";
}

/**
 * Check if sender can be blocked
 * Reference: Page 6 Section 6.5 - Safety Rules
 */
export function canBlockSender(
    email: NormalizedEmail
): { allowed: boolean; reason?: string } {
    // Never block personal senders
    if (isLikelyPersonalSender(email)) {
        return { allowed: false, reason: "Cannot block personal senders" };
    }

    // Never block transactional senders
    if (isTransactional(email)) {
        return { allowed: false, reason: "Cannot block transactional senders" };
    }

    // Check domain safety
    const domainSafety = getDomainSafetyCategory(email.senderDomain);
    if (domainSafety === "never_nuke") {
        return { allowed: false, reason: "Cannot block senders from protected domains" };
    }

    return { allowed: true };
}

/**
 * Check if domain can be nuked
 * Reference: Page 6 Section 6.5 - Safety Rules
 */
export function canNukeDomain(
    domain: string
): { allowed: boolean; requiresConfirmation: boolean; reason?: string } {
    const safety = getDomainSafetyCategory(domain);

    if (safety === "never_nuke") {
        return {
            allowed: false,
            requiresConfirmation: false,
            reason: "This domain cannot be nuked (protected)",
        };
    }

    if (safety === "caution") {
        return {
            allowed: true,
            requiresConfirmation: true,
            reason: "This domain may contain important emails. Please confirm.",
        };
    }

    return {
        allowed: true,
        requiresConfirmation: false,
    };
}
