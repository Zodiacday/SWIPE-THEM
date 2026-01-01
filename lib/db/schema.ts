/**
 * Database Schema for Swipe
 * Reference: Page 8 — DATABASE SCHEMA
 */

import {
    pgTable,
    uuid,
    text,
    timestamp,
    boolean,
    real,
    integer,
    jsonb,
    uniqueIndex,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// Table: users (Page 8 Section 8.2)
// ============================================================================
export const users = pgTable(
    "users",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
        name: text("name"),
        email: text("email").unique().notNull(),
        onboardingState: text("onboarding_state").default("welcome"), // welcome, problem, promise, safety, connect, tutorial, first_cleanup, complete
        settings: jsonb("settings").default({
            soundEnabled: true,
            hapticEnabled: true,
            theme: "light",
            notifications: true,
        }),
        // Gamification fields
        xp: integer("xp").default(0).notNull(),
        level: integer("level").default(1).notNull(),
        streak: integer("streak").default(0).notNull(),
        lastCleanupDate: timestamp("last_cleanup_date"),
        badges: jsonb("badges").default([]),
        title: text("title").default("Inbox Apprentice"),
    },
    (table) => [index("users_email_idx").on(table.email)]
);

// ============================================================================
// Table: email_accounts (Page 8 Section 8.3)
// ============================================================================
export const emailAccounts = pgTable(
    "email_accounts",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        provider: text("provider").notNull(), // gmail, outlook, yahoo, icloud, imap
        emailAddress: text("email_address").notNull(),
        accessToken: text("access_token"), // encrypted
        refreshToken: text("refresh_token"), // encrypted
        tokenExpiresAt: timestamp("token_expires_at"),
        syncCursor: text("sync_cursor"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        index("email_accounts_user_id_idx").on(table.userId),
        uniqueIndex("email_accounts_provider_email_idx").on(
            table.provider,
            table.emailAddress
        ),
    ]
);

// ============================================================================
// Table: domains (Page 8 Section 8.6)
// ============================================================================
export const domains = pgTable(
    "domains",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        domainName: text("domain_name").unique().notNull(),
        reputationScore: real("reputation_score").default(0.5), // 0 to 1
        isSafeToNuke: boolean("is_safe_to_nuke").default(true),
        category: text("category"), // safe_to_nuke, caution, never_nuke
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [index("domains_domain_name_idx").on(table.domainName)]
);

// ============================================================================
// Table: senders (Page 8 Section 8.5)
// ============================================================================
export const senders = pgTable(
    "senders",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        emailAddress: text("email_address").unique().notNull(),
        domainId: uuid("domain_id").references(() => domains.id),
        reputationScore: real("reputation_score").default(0.5), // 0 to 1
        frequencyScore: real("frequency_score").default(0),
        lastSeen: timestamp("last_seen"),
        emailsPerDay: real("emails_per_day").default(0),
        emailsPerWeek: real("emails_per_week").default(0),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [index("senders_email_address_idx").on(table.emailAddress)]
);

// ============================================================================
// Table: emails (Page 8 Section 8.4)
// ============================================================================
export const emails = pgTable(
    "emails",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        accountId: uuid("account_id")
            .references(() => emailAccounts.id, { onDelete: "cascade" })
            .notNull(),
        providerId: text("provider_id").notNull(), // provider-specific message ID
        senderId: uuid("sender_id").references(() => senders.id),
        domainId: uuid("domain_id").references(() => domains.id),
        subject: text("subject"),
        timestamp: timestamp("timestamp").notNull(),
        category: text("category"), // newsletter, promo, social, transactional, personal, unknown
        listUnsubscribe: jsonb("list_unsubscribe").default({
            http: null,
            mailto: null,
        }),
        metadata: jsonb("metadata").default({}), // provider-specific metadata
        isDeleted: boolean("is_deleted").default(false),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        // Detection result
        detectionConfidence: real("detection_confidence"),
        detectionSignals: jsonb("detection_signals"),
    },
    (table) => [
        index("emails_account_id_timestamp_idx").on(table.accountId, table.timestamp),
        index("emails_sender_id_idx").on(table.senderId),
        index("emails_domain_id_idx").on(table.domainId),
        uniqueIndex("emails_account_provider_id_idx").on(
            table.accountId,
            table.providerId
        ),
    ]
);

// ============================================================================
// Table: actions (Page 8 Section 8.7)
// ============================================================================
export const actions = pgTable(
    "actions",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        emailId: uuid("email_id").references(() => emails.id),
        actionType: text("action_type").notNull(), // delete, unsubscribe, block, keep, nuke
        provider: text("provider").notNull(),
        timestamp: timestamp("timestamp").defaultNow().notNull(),
        metadata: jsonb("metadata").default({}),
        isUndone: boolean("is_undone").default(false),
    },
    (table) => [
        index("actions_user_id_timestamp_idx").on(table.userId, table.timestamp),
    ]
);

// ============================================================================
// Table: rules (Page 8 Section 8.8)
// ============================================================================
export const rules = pgTable("rules", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    ruleType: text("rule_type").notNull(), // auto_delete, auto_block, auto_nuke, auto_archive
    senderId: uuid("sender_id").references(() => senders.id),
    domainId: uuid("domain_id").references(() => domains.id),
    conditions: jsonb("conditions").default({
        frequencyThreshold: null,
        spamScoreThreshold: null,
        category: null,
        timeWindow: null,
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    isEnabled: boolean("is_enabled").default(true),
});

// ============================================================================
// Table: cleanup_logs (Page 8 Section 8.10)
// ============================================================================
export const cleanupLogs = pgTable("cleanup_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    sessionId: uuid("session_id").notNull(),
    emailsProcessed: integer("emails_processed").default(0).notNull(),
    actionsTaken: integer("actions_taken").default(0).notNull(),
    timeSpentMs: integer("time_spent_ms").default(0).notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    // Session stats
    combosAchieved: integer("combos_achieved").default(0),
    bossFightsWon: integer("boss_fights_won").default(0),
    xpEarned: integer("xp_earned").default(0),
    mode: text("mode"), // zen, rage, normal
});

// ============================================================================
// Table: undo_tokens (Page 8 Section 8.11)
// ============================================================================
export const undoTokens = pgTable("undo_tokens", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    actionId: uuid("action_id")
        .references(() => actions.id, { onDelete: "cascade" })
        .notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    metadata: jsonb("metadata").default({}),
    isUsed: boolean("is_used").default(false),
});

// ============================================================================
// Relations
// ============================================================================
export const usersRelations = relations(users, ({ many }) => ({
    emailAccounts: many(emailAccounts),
    actions: many(actions),
    rules: many(rules),
    cleanupLogs: many(cleanupLogs),
    undoTokens: many(undoTokens),
}));

export const emailAccountsRelations = relations(
    emailAccounts,
    ({ one, many }) => ({
        user: one(users, {
            fields: [emailAccounts.userId],
            references: [users.id],
        }),
        emails: many(emails),
    })
);

export const domainsRelations = relations(domains, ({ many }) => ({
    senders: many(senders),
    emails: many(emails),
}));

export const sendersRelations = relations(senders, ({ one, many }) => ({
    domain: one(domains, {
        fields: [senders.domainId],
        references: [domains.id],
    }),
    emails: many(emails),
}));

export const emailsRelations = relations(emails, ({ one }) => ({
    account: one(emailAccounts, {
        fields: [emails.accountId],
        references: [emailAccounts.id],
    }),
    sender: one(senders, {
        fields: [emails.senderId],
        references: [senders.id],
    }),
    domain: one(domains, {
        fields: [emails.domainId],
        references: [domains.id],
    }),
}));

export const actionsRelations = relations(actions, ({ one }) => ({
    user: one(users, {
        fields: [actions.userId],
        references: [users.id],
    }),
    email: one(emails, {
        fields: [actions.emailId],
        references: [emails.id],
    }),
}));

export const rulesRelations = relations(rules, ({ one }) => ({
    user: one(users, {
        fields: [rules.userId],
        references: [users.id],
    }),
    sender: one(senders, {
        fields: [rules.senderId],
        references: [senders.id],
    }),
    domain: one(domains, {
        fields: [rules.domainId],
        references: [domains.id],
    }),
}));

export const cleanupLogsRelations = relations(cleanupLogs, ({ one }) => ({
    user: one(users, {
        fields: [cleanupLogs.userId],
        references: [users.id],
    }),
}));

export const undoTokensRelations = relations(undoTokens, ({ one }) => ({
    user: one(users, {
        fields: [undoTokens.userId],
        references: [users.id],
    }),
    action: one(actions, {
        fields: [undoTokens.actionId],
        references: [actions.id],
    }),
}));

// ============================================================================
// Type Exports
// ============================================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type EmailAccount = typeof emailAccounts.$inferSelect;
export type NewEmailAccount = typeof emailAccounts.$inferInsert;
export type Domain = typeof domains.$inferSelect;
export type NewDomain = typeof domains.$inferInsert;
export type Sender = typeof senders.$inferSelect;
export type NewSender = typeof senders.$inferInsert;
export type Email = typeof emails.$inferSelect;
export type NewEmail = typeof emails.$inferInsert;
export type Action = typeof actions.$inferSelect;
export type NewAction = typeof actions.$inferInsert;
export type Rule = typeof rules.$inferSelect;
export type NewRule = typeof rules.$inferInsert;
export type CleanupLog = typeof cleanupLogs.$inferSelect;
export type NewCleanupLog = typeof cleanupLogs.$inferInsert;
export type UndoToken = typeof undoTokens.$inferSelect;
export type NewUndoToken = typeof undoTokens.$inferInsert;
