import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect = vi.fn();
  observe = vi.fn((target: Element) => {
    this.callback([
      {
        isIntersecting: true,
        target,
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRatio: 1,
        intersectionRect: target.getBoundingClientRect(),
        rootBounds: null,
        time: Date.now(),
      } as unknown as IntersectionObserverEntry,
    ], this);
  });
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();
  constructor(private callback: IntersectionObserverCallback) {}
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
