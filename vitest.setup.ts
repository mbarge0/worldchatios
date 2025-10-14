import '@testing-library/jest-dom';

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

