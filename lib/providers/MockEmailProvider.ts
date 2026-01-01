/**
 * Mock Email Provider - Obsidian Mint Edition
 * Simulates real-world API scale and latency.
 */

import { NormalizedEmail } from "../types";

export class MockEmailProvider {
    private static MOCK_SUBJECTS = [
        "Your weekly digest",
        "Special offer just for you!",
        "Security alert: New login",
        "Someone replied to your comment",
        "Download your receipt",
        "Urgent: Action required",
        "Meet our new team member",
        "Your order has shipped!",
        "Invitation: Networking event",
        "Did you miss this?"
    ];

    private static MOCK_SENDERS = [
        { name: "Newsletter Daily", domain: "news.com" },
        { name: "Mega Promo", domain: "promo.io" },
        { name: "Social Hub", domain: "social.net" },
        { name: "Dev Ops Weekly", domain: "dev.to" },
        { name: "Finance Guru", domain: "money.com" },
        { name: "Spam Lord", domain: "spam.com" }, // For grouping/boss tests
    ];

    /**
     * Generates a realistic batch of emails.
     */
    public static async fetchBatch(
        startIndex: number,
        count: number = 50
    ): Promise<NormalizedEmail[]> {
        // Simulate API Latency
        await new Promise(resolve => setTimeout(resolve, 800));

        return Array.from({ length: count }).map((_, i) => {
            const id = (startIndex + i).toString();
            const sender = this.MOCK_SENDERS[Math.floor(Math.random() * this.MOCK_SENDERS.length)];

            return {
                id,
                provider: "gmail",
                providerId: `g-${id}`,
                sender: `contact@${sender.domain}`,
                senderName: sender.name,
                senderDomain: sender.domain,
                subject: `${this.MOCK_SUBJECTS[Math.floor(Math.random() * this.MOCK_SUBJECTS.length)]} #${id}`,
                preview: "This is a simulated preview of the email content to test the high-density cards...",
                receivedAt: new Date(Date.now() - Math.random() * 100000000).toISOString(),
                timestamp: Date.now() - Math.random() * 100000000,
                listUnsubscribe: { http: "http://unsub.com", mailto: null },
                category: "newsletter",
                labels: ["inbox"],
                isRead: false,
                size: 1024 + Math.random() * 5000,
                metadata: {},
                headers: {}
            };
        });
    }
}
