import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill ResizeObserver for jsdom
class ResizeObserverMock {
    callback: ResizeObserverCallback
    constructor(callback: ResizeObserverCallback) {
        this.callback = callback
    }
    observe() { }
    unobserve() { }
    disconnect() { }
}
; (global as any).ResizeObserver = ResizeObserverMock as any

// Mock Firebase client module to avoid real network/init in unit tests
vi.mock('@/lib/firebase', () => ({
    app: {},
    auth: {} as any,
    db: {} as any,
    rtdb: {} as any,
}))

vi.mock('@/lib/firebase/client', () => ({
    app: {},
    auth: {} as any,
    db: {} as any,
    getAuthClient: () => ({} as any),
}))

