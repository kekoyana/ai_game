import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// extend vitest's expect with @testing-library/jest-dom's matchers
expect.extend(matchers)

// cleanup after each test case
afterEach(() => {
  cleanup()
})