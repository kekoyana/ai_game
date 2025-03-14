import { describe, test, expect } from 'vitest'
import { isGeneralAvailable, General } from './general'

describe('isGeneralAvailable', () => {
  const baseGeneral: General = {
    id: "test",
    name: "テスト武将",
    stats: { war: 70, int: 70, lead: 70, pol: 70 },
    loyalty: 100,
    lordId: "test_lord",
    available: true,
    // lastActionDateはオプショナルなので初期値では設定しない
  }

  test('lastActionDateが未設定の武将は行動可能', () => {
    const general = { ...baseGeneral }
    expect(isGeneralAvailable(general, 189, 4)).toBe(true)
  })

  test('同じ月に行動済みの場合は行動不可', () => {
    const general = {
      ...baseGeneral,
      lastActionDate: { year: 189, month: 4 }
    }
    expect(isGeneralAvailable(general, 189, 4)).toBe(false)
  })

  test('前月の行動履歴なら行動可能', () => {
    const general = {
      ...baseGeneral,
      lastActionDate: { year: 189, month: 3 }
    }
    expect(isGeneralAvailable(general, 189, 4)).toBe(true)
  })

  test('前年の行動履歴なら行動可能', () => {
    const general = {
      ...baseGeneral,
      lastActionDate: { year: 188, month: 12 }
    }
    expect(isGeneralAvailable(general, 189, 1)).toBe(true)
  })

  test('月が変わったら行動可能になる', () => {
    const general = {
      ...baseGeneral,
      lastActionDate: { year: 189, month: 4 }
    }
    expect(isGeneralAvailable(general, 189, 5)).toBe(true)
  })

  test('別の年の同じ月でも行動可能', () => {
    const general = {
      ...baseGeneral,
      lastActionDate: { year: 189, month: 4 }
    }
    expect(isGeneralAvailable(general, 190, 4)).toBe(true)
  })
})