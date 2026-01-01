/**
 * Email Normalization Layer
 * Reference: Page 3 — BACKEND ARCHITECTURE (Section 3.6)
 * 
 * Normalizes email data from different providers into a unified interface.
 */

/**
 * Normalized Email interface
 * Consistent across all providers: Gmail, Outlook, IMAP
 */
export interface NormalizedEmail {
    id: string;
    provider: "gmail" | "outlook" | "yahoo" | "imap";
    providerId: string;
    sender: string;
    senderName: string | null;
    senderDomain: string;
    subject: string;
    preview: string;
    receivedAt: string;
    timestamp: number; // Unix timestamp in ms
    listUnsubscribe: {
        http: string | null;
        mailto: string | null;
    };
    category: "newsletter" | "promo" | "social" | "transactional" | "personal" | "unknown";
    labels: string[];
    isRead: boolean;
    size: number;
    metadata: Record<string, unknown>;
    // Headers for detection
    headers: {
        precedence?: string;
        returnPath?: string;
        xMailer?: string;
        xCampaign?: string;
        xNewsletter?: string;
        xList?: string;
        xSgEid?: string;
        xMailgunSid?: string;
        xMailchimp?: string;
    };
}

/**
 * Detection Result interface
 * Reference: Page 4 Section 4.12
 */
export interface DetectionResult {
    type: "newsletter" | "promo" | "social" | "transactional" | "personal" | "unknown";
    confidence: number;
    signals: {
        listUnsubscribe: boolean;
        senderReputation: number;
        providerCategory: string | null;
        frequencyScore: number;
        htmlSignals: number;
        headerSignals: number;
    };
}

/**
 * Unsubscribe Result interface
 * Reference: Page 5 Section 5.8
 */
export interface UnsubscribeResult {
    success: boolean;
    method: "http" | "mailto" | "provider" | "block" | "spam";
    fallbackUsed: boolean;
    undoToken: string | null;
    metadata: Record<string, unknown>;
}

/**
 * Block Result interface
 * Reference: Page 6 Section 6.10
 */
export interface BlockResult {
    success: boolean;
    action: "block" | "domain_nuke";
    undoToken: string | null;
    metadata: Record<string, unknown>;
}

/**
 * Action Log interface
 * Reference: Page 3 Section 3.9
 */
export interface ActionLog {
    id: string;
    userId: string;
    emailId: string;
    actionType: "delete" | "unsubscribe" | "block" | "keep" | "nuke";
    timestamp: number;
    provider: string;
    metadata: Record<string, unknown>;
}

/**
 * Rule interface
 * Reference: Page 12 Section 12.3
 */
export interface RuleInterface {
    id: string;
    userId: string;
    ruleType: "auto_delete" | "auto_block" | "auto_nuke" | "auto_archive";
    senderId: string | null;
    domainId: string | null;
    conditions: {
        frequencyThreshold: number | null;
        spamScoreThreshold: number | null;
        category: string | null;
        timeWindow: string | null;
    };
    isEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Swipe Action type
 */
export type SwipeAction = "delete" | "unsubscribe" | "block" | "keep" | "nuke";

/**
 * Swipe Direction type
 */
export type SwipeDirection = "left" | "right" | "up" | "down";

/**
 * Swipe configuration mapping
 * Reference: Page 9 Section 9.3
 */
export const SWIPE_CONFIG = {
    left: {
        action: "delete" as SwipeAction,
        color: "#ef4444", // red-500
        icon: "trash",
        tilt: -8,
        threshold: 0.25,
    },
    right: {
        action: "unsubscribe" as SwipeAction,
        color: "#3b82f6", // blue-500
        icon: "mail-x",
        tilt: 8,
        threshold: 0.25,
    },
    up: {
        action: "block" as SwipeAction,
        color: "#f97316", // orange-500
        icon: "ban",
        lift: 12,
        threshold: 0.2,
    },
    down: {
        action: "keep" as SwipeAction,
        color: "#22c55e", // green-500
        icon: "check",
        drop: 12,
        threshold: 0.2,
    },
} as const;

/**
 * Domain safety classification
 * Reference: Page 6 Section 6.6
 */
export const DOMAIN_SAFETY = {
    // Never nuke - Big tech, banks, government, utilities, healthcare
    neverNuke: [
        "google.com",
        "gmail.com",
        "apple.com",
        "icloud.com",
        "microsoft.com",
        "amazon.com",
        "facebook.com",
        "meta.com",
        "twitter.com",
        "x.com",
        "linkedin.com",
        "gov",
        "edu",
        "mil",
        // Banks (examples)
        "chase.com",
        "bankofamerica.com",
        "wellsfargo.com",
        "citibank.com",
        "usbank.com",
        // Airlines
        "united.com",
        "delta.com",
        "aa.com",
        "southwest.com",
    ],
    // Caution - E-commerce, airlines, subscription services
    caution: [
        "ebay.com",
        "etsy.com",
        "shopify.com",
        "netflix.com",
        "spotify.com",
        "hulu.com",
        "disneyplus.com",
        "hbomax.com",
    ],
    // Safe to nuke - Marketing platforms, newsletter services
    safeToNuke: [
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
        "revue.co",
        "buttondown.email",
        "getresponse.com",
        "activecampaign.com",
    ],
};

/**
 * XP rewards configuration
 * Reference: Page 10 Section 10.7
 */
export const XP_REWARDS = {
    swipeDelete: 5,
    swipeUnsubscribe: 10,
    swipeBlock: 8,
    swipeKeep: 3,
    domainNuke: 25,
    comboMultiplier: 1.5,
    bossFightWin: 50,
    dailyStreak: 10,
};

/**
 * Level thresholds
 * Reference: Page 10 Section 10.7
 */
export const LEVEL_THRESHOLDS = [
    0,    // Level 1
    100,  // Level 2
    200,  // Level 3
    350,  // Level 4
    500,  // Level 5
    750,  // Level 6
    1100, // Level 7
    1550, // Level 8
    2100, // Level 9
    2750, // Level 10
];

/**
 * Badge definitions
 * Reference: Page 10 Section 10.7
 */
export const BADGES = {
    comboMaster: {
        id: "combo_master",
        name: "Combo Master",
        description: "Achieved a 10+ combo",
        icon: "zap",
    },
    zenMaster: {
        id: "zen_master",
        name: "Zen Master",
        description: "Completed 3 Zen sessions",
        icon: "lotus",
    },
    rageWarrior: {
        id: "rage_warrior",
        name: "Rage Warrior",
        description: "Completed 3 Rage sessions",
        icon: "flame",
    },
    bossSlayer: {
        id: "boss_slayer",
        name: "Boss Slayer",
        description: "Defeated 5 bosses",
        icon: "skull",
    },
    inboxHero: {
        id: "inbox_hero",
        name: "Inbox Hero",
        description: "Cleared 1000 emails",
        icon: "trophy",
    },
    domainDestroyer: {
        id: "domain_destroyer",
        name: "Domain Destroyer",
        description: "Nuked 10 domains",
        icon: "bomb",
    },
    unsubscribeNinja: {
        id: "unsubscribe_ninja",
        name: "Unsubscribe Ninja",
        description: "Unsubscribed from 50 senders",
        icon: "eye-off",
    },
};

/**
 * Title progression
 * Reference: Page 10 Section 10.7
 */
export const TITLES = [
    { level: 1, title: "Inbox Apprentice" },
    { level: 3, title: "Cleanup Specialist" },
    { level: 5, title: "Email Warrior" },
    { level: 7, title: "Inbox Samurai" },
    { level: 9, title: "Zen Master" },
    { level: 10, title: "Inbox Legend" },
];
