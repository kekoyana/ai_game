import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// テストケース実行後にレンダリングされたコンポーネントをクリーンアップ
afterEach(() => {
  cleanup();
});