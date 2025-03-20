import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { generateShopItems, ShopItem } from '../data/shop'
import { rewardPool } from '../data/cards'
import { relicPool, Relic } from '../data/relics'
import { addCardToDeck, addRelic, spendGold } from '../store/slices/gameSlice'
import { clearNode } from '../store/slices/mapSlice'
import { MapNode } from '../data/mapNodes'
import Card from './Card'
import './Shop.css'

export const Shop = () => {
  const dispatch = useDispatch()
  const gold = useSelector((state: RootState) => state.game.gold)
  const currentNodeId = useSelector((state: RootState) => state.map.currentNodeId)
  const currentNode = useSelector((state: RootState) => {
    return state.map.currentMap.nodes.find((node: MapNode) => node.id === currentNodeId)
  })
  
  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [soldItems, setSoldItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    const items = generateShopItems(rewardPool, relicPool, currentNode?.level || 1)
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
                  <Card {...item.item} />
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