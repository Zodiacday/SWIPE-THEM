import { NormalizedEmail } from "../types";

export interface BufferItem {
    email: NormalizedEmail;
    isBossField?: boolean;
    groupCount?: number;
}

export interface BufferConfig {
    windowSize: number;
    triggerThreshold: number;
    batchSize: number;
}

const DEFAULT_CONFIG: BufferConfig = {
    windowSize: 30,      // Max items in active UI memory
    triggerThreshold: 10, // Fetch more when [x] items remain
    batchSize: 50,       // Number of items to fetch from API
};

export class SwipeBuffer {
    private fullQueue: NormalizedEmail[] = [];
    private activeWindow: BufferItem[] = [];
    private onRefillRequired: () => Promise<NormalizedEmail[]>;
    private config: BufferConfig;
    private isFetching: boolean = false;

    constructor(
        initialEmails: NormalizedEmail[],
        onRefill: () => Promise<NormalizedEmail[]>,
        config: Partial<BufferConfig> = {}
    ) {
        this.fullQueue = initialEmails;
        this.onRefillRequired = onRefill;
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.syncWindow();
    }

    public getWindow(): BufferItem[] {
        return this.activeWindow;
    }

    public getFullQueue(): NormalizedEmail[] {
        return this.fullQueue;
    }

    public getIsFetching(): boolean {
        return this.isFetching;
    }

    public addItem(email: NormalizedEmail, index: number = 0): void {
        this.fullQueue.splice(index, 0, email);
        this.syncWindow();
    }

    public async consumeItem(id: string): Promise<void> {
        this.activeWindow = this.activeWindow.filter(item => item.email.id !== id);
        this.fullQueue = this.fullQueue.filter(email => email.id !== id);

        if (this.activeWindow.length <= this.config.triggerThreshold && !this.isFetching) {
            await this.refill();
        }
        this.syncWindow();
    }

    public async consumeBatch(ids: string[]): Promise<void> {
        const idSet = new Set(ids);
        this.activeWindow = this.activeWindow.filter(item => !idSet.has(item.email.id));
        this.fullQueue = this.fullQueue.filter(email => !idSet.has(email.id));

        if (this.activeWindow.length <= this.config.triggerThreshold && !this.isFetching) {
            await this.refill();
        }
        this.syncWindow();
    }

    public nukeDomain(domain: string): void {
        this.fullQueue = this.fullQueue.filter(email => email.senderDomain !== domain);
        this.syncWindow();
    }

    private async refill(): Promise<void> {
        this.isFetching = true;
        try {
            const newItems = await this.onRefillRequired();
            const uniqueNewItems = newItems.filter(
                newItem => !this.fullQueue.some(existing => existing.id === newItem.id)
            );
            this.fullQueue = [...this.fullQueue, ...uniqueNewItems];
        } finally {
            this.isFetching = false;
            this.syncWindow();
        }
    }

    private syncWindow(): void {
        const rawItems = this.fullQueue.slice(0, this.config.windowSize);
        this.activeWindow = this.groupIntoBosses(rawItems);
    }

    private groupIntoBosses(emails: NormalizedEmail[]): BufferItem[] {
        const items: BufferItem[] = [];
        const processed = new Set<string>();

        for (const email of emails) {
            if (processed.has(email.id)) continue;

            const sameDomain = emails.filter(e => e.senderDomain === email.senderDomain && !processed.has(e.id));

            if (sameDomain.length >= 5) {
                items.push({
                    email: sameDomain[0],
                    isBossField: true,
                    groupCount: sameDomain.length
                });
                sameDomain.forEach(e => processed.add(e.id));
            } else {
                items.push({ email });
                processed.add(email.id);
            }
        }

        return items;
    }

    public getRemainingCount(): number {
        return this.fullQueue.length;
    }
}
