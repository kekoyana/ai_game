import { beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom'

beforeEach(() => {
  vi.resetAllMocks()
  document.body.innerHTML = ''
});

// fetchのデフォルトモック
global.fetch = vi.fn();

// CSVローダーのモック
vi.mock('../utils/csvLoader', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../utils/csvLoader')>();
  return {
    ...mod,
  };
});

// TimeManagerのモック
vi.mock('../managers/timeManager', () => ({
  timeManager: {
    getCurrentTime: vi.fn(() => new Date('2025-03-02T08:00:00')),
    getFormattedTime: vi.fn(() => '08:00'),
    advanceTime: vi.fn(),
    addTimeListener: vi.fn(),
    removeTimeListener: vi.fn(),
  },
}));