import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { Card as CardType, CardRarity } from '../data/cards'
import Card from './Card'
import './DeckView.css'

const DeckView = () => {
  const deck = useSelector((state: RootState) => state.game.deck)
  const [sortBy, setSortBy] = useState<'rarity' | 'cost'>('cost')

  // カードを表示順にソート
  const sortedDeck = [...deck].sort((a, b) => {
    if (sortBy === 'rarity') {
      const rarityOrder: { [key in CardRarity]: number } = {
        'SSR': 0,
        'SR': 1,
        'R': 2,
        'C': 3
      }
      return rarityOrder[a.rarity] - rarityOrder[b.rarity]
    } else {
      return a.cost - b.cost
    }
  })

  return (
    <div className="deck-view" onClick={(e) => e.stopPropagation()}>
      <div className="deck-header">
        <h2>所持カード一覧</h2>
        <div className="sort-controls">
          <button
            onClick={() => setSortBy('cost')}
            className={`sort-button ${sortBy === 'cost' ? 'active' : ''}`}
          >
            コスト順
          </button>
          <button
            onClick={() => setSortBy('rarity')}
            className={`sort-button ${sortBy === 'rarity' ? 'active' : ''}`}
          >
            レアリティ順
          </button>
        </div>
      </div>

      <div className="deck-stats">
        <div>総カード数: {deck.length}</div>
        <div>
          レアリティ内訳：
          SSR: {deck.filter(card => card.rarity === 'SSR').length}枚,
          SR: {deck.filter(card => card.rarity === 'SR').length}枚,
          R: {deck.filter(card => card.rarity === 'R').length}枚,
          C: {deck.filter(card => card.rarity === 'C').length}枚
        </div>
      </div>

      <div className="deck-grid">
        {sortedDeck.map((card: CardType) => (
          <div key={card.id} className="deck-card">
            <Card {...card} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeckView
