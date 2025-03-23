import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { generateShopItems, ShopItem } from '../data/shop'
import { getRewardPool, Card as CardType } from '../data/cards'
import { relicPool, Relic } from '../data/relics'
import { addCardToDeck, addRelic, spendGold, removeCardFromDeck } from '../store/slices/gameSlice'
import { clearNode } from '../store/slices/mapSlice'
import { MapNode } from '../data/mapNodes'
import CardComponent from './Card'
import './Shop.css'


export const Shop = () => {
  const dispatch = useDispatch()
  const gold = useSelector((state: RootState) => state.game.gold)
  const currentNodeId = useSelector((state: RootState) => state.map.currentNodeId)
  const currentNode = useSelector((state: RootState) => {
    return state.map.currentMap.nodes.find((node: MapNode) => node.id === currentNodeId)
  })
  
  const deck = useSelector((state: RootState) => state.game.deck)
  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [soldItems, setSoldItems] = useState<Set<string>>(new Set())
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  const [hasUsedRemoveService, setHasUsedRemoveService] = useState(false)

  useEffect(() => {
    const items = generateShopItems(getRewardPool(), relicPool, currentNode?.level || 1)
    setShopItems(items)
  }, [currentNode])

  const handlePurchase = (item: ShopItem) => {
    if (gold < item.cost || soldItems.has(item.id)) return

    dispatch(spendGold(item.cost))
    
    if (item.type === 'card' && 'cost' in item.item) {
      dispatch(addCardToDeck(item.item))
    } else if (item.type === 'relic' && 'effect' in item.item) {
      dispatch(addRelic(item.item))
    }

    setSoldItems(new Set([...soldItems, item.id]))

    const allItemsSold = shopItems.every(shopItem => 
      soldItems.has(shopItem.id) || [...soldItems, item.id].includes(shopItem.id)
    )
    
    if (allItemsSold) {
      dispatch(clearNode(currentNodeId))
    }
  }

  const handleSkip = () => {
    if (currentNodeId) {
      dispatch(clearNode(currentNodeId))
    }
  }

  const cardItems = shopItems.filter(item => item.type === 'card')
  const relicItems = shopItems.filter(item => item.type === 'relic')

  return (
    <div className="event-node shop" onClick={(e) => e.stopPropagation()}>
      <div className="shop-header">
        <h2>商店</h2>
        <div className="shop-gold">所持金: {gold} G</div>
      </div>
      
      <div className="shop-section">
        <h3 className="shop-section-title">カード</h3>
        <div className="shop-items">
          {cardItems.map((item) => {
            if (!('cost' in item.item)) return null;
            return (
              <div key={item.id} className="shop-card-container">
                <div 
                  className={`shop-card-clickable ${soldItems.has(item.id) ? 'disabled' : ''}`}
                  onClick={() => !soldItems.has(item.id) && handlePurchase(item)}
                >
                  <CardComponent {...item.item} />
                </div>
                <div className={`shop-item-overlay ${soldItems.has(item.id) ? 'sold' : ''}`}>
                  <div className="shop-item-price">{item.cost} G</div>
                  {soldItems.has(item.id) && <div className="sold-text">売り切れ</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="shop-section">
        <h3 className="shop-section-title">お宝</h3>
        <div className="shop-items">
          {relicItems.map((item) => {
            const relic = item.item as Relic;
            return (
              <div
                key={item.id}
                className={`shop-item ${soldItems.has(item.id) ? 'sold' : ''} rarity-${item.rarity}`}
              >
                <div className="item-header">
                  <div className="relic-icon">{relic.image}</div>
                  <h3>{item.name}</h3>
                  <div className="item-cost">{item.cost} G</div>
                </div>
                <p className="item-description">{item.description}</p>
                <button
                  className="purchase-button"
                  onClick={() => handlePurchase(item)}
                  disabled={gold < item.cost || soldItems.has(item.id)}
                >
                  {soldItems.has(item.id) ? '売り切れ' : '購入'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* カード破棄セクション */}
      <div className="shop-section">
        <h3 className="shop-section-title">カード破棄サービス</h3>
        <div className="shop-service">
          <p className="service-description">デッキからカードを1枚除去できます（50G）</p>
          <button
            className="service-button"
            onClick={() => setShowRemoveDialog(true)}
            disabled={gold < 50 || hasUsedRemoveService}
          >
            {hasUsedRemoveService ? 'すでに使用済み' : 'カードを破棄する'}
          </button>
        </div>
      </div>

      {showRemoveDialog && (
        <div className="overlay">
          <div className="deck-view modal-content">
            <div className="deck-header">
              <h2>破棄するカードを選択</h2>
            </div>
            <div className="deck-grid">
              {deck.map((card: CardType) => (
                <div
                  key={card.id}
                  className={`deck-card ${selectedCard?.id === card.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCard(card)}
                >
                  <CardComponent {...card} />
                </div>
              ))}
            </div>
            <div className="shop-footer dialog-buttons">
              <button
                className="purchase-button"
                onClick={() => {
                  if (selectedCard) {
                    dispatch(spendGold(50))
                    dispatch(removeCardFromDeck(selectedCard))
                    setHasUsedRemoveService(true)
                    setShowRemoveDialog(false)
                    setSelectedCard(null)
                  }
                }}
                disabled={!selectedCard || gold < 50}
              >
                確認（50G）
              </button>
              <button
                className="skip-button"
                onClick={() => {
                  setShowRemoveDialog(false)
                  setSelectedCard(null)
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="shop-footer">
        <button
          type="button"
          onClick={handleSkip}
          className="skip-button"
        >
          何も購入せずに出る
        </button>
      </div>
    </div>
  )
}