import { useState, useCallback, useRef, useEffect } from "react";
import { NormalizedEmail } from "../lib/types";
import { SwipeBuffer, BufferItem, BufferConfig } from "../lib/engines/buffer";

export function useSwipeBuffer(
    initialEmails: NormalizedEmail[],
    onRefill: () => Promise<NormalizedEmail[]>,
    config?: Partial<BufferConfig>
) {
    // Create buffer ref FIRST before any state that depends on it
    const bufferRef = useRef<SwipeBuffer | null>(null);

    // Initialize buffer synchronously on first call
    if (!bufferRef.current) {
        bufferRef.current = new SwipeBuffer(initialEmails, onRefill, config);
    }

    // Initialize state FROM the buffer to avoid empty first render
    const [activeWindow, setActiveWindow] = useState<BufferItem[]>(
        () => bufferRef.current?.getWindow() || []
    );
    const [fullQueue, setFullQueue] = useState<NormalizedEmail[]>(
        () => bufferRef.current?.getFullQueue() || initialEmails
    );
    const [remainingCount, setRemainingCount] = useState(
        () => bufferRef.current?.getRemainingCount() || initialEmails.length
    );
    const [isFetching, setIsFetching] = useState(false);

    const syncWithBuffer = useCallback(() => {
        if (bufferRef.current) {
            setActiveWindow([...bufferRef.current.getWindow()]);
            setFullQueue([...bufferRef.current.getFullQueue()]);
            setRemainingCount(bufferRef.current.getRemainingCount());
            setIsFetching(bufferRef.current.getIsFetching());
        }
    }, []);

    // Sync on mount (for any async updates)
    useEffect(() => {
        syncWithBuffer();
    }, [syncWithBuffer]);

    const consume = useCallback(async (id: string) => {
        if (bufferRef.current) {
            await bufferRef.current.consumeItem(id);
            syncWithBuffer();
        }
    }, [syncWithBuffer]);

    const consumeBatch = useCallback(async (ids: string[]) => {
        if (bufferRef.current) {
            await bufferRef.current.consumeBatch(ids);
            syncWithBuffer();
        }
    }, [syncWithBuffer]);

    const nukeDomain = useCallback((domain: string) => {
        if (bufferRef.current) {
            bufferRef.current.nukeDomain(domain);
            syncWithBuffer();
        }
    }, [syncWithBuffer]);

    const undo = useCallback((email: NormalizedEmail) => {
        if (bufferRef.current) {
            bufferRef.current.addItem(email);
            syncWithBuffer();
        }
    }, [syncWithBuffer]);

    const reset = useCallback((emails: NormalizedEmail[]) => {
        bufferRef.current = new SwipeBuffer(emails, onRefill, config);
        syncWithBuffer();
    }, [onRefill, config, syncWithBuffer]);

    return {
        activeWindow,
        fullQueue,
        remainingCount,
        consume,
        consumeBatch,
        nukeDomain,
        undo,
        reset,
        isFetching,
    };
}
