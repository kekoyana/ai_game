import { Card as CardType } from '../data/cards'
import Card from './Card'
import { nanoid } from 'nanoid'

const REWARD_CARDS_COUNT = 3

// カード報酬を生成する関数
const generateRewardCards = (): CardType[] => {
  const rewardCards: CardType[] = [
    {
      id: nanoid(),
      name: '飛龍の剣',
      cost: 2,
      type: 'attack',
      description: '14ダメージを与える',
      effects: { damage: 14 },
      character: '青面獣 楊志',
      flavorText: '青龍偃月刀の使い手'
    },
    {
      id: nanoid(),
      name: '義の心得',
      cost: 1,
      type: 'skill',
      description: '10ブロックを得る',
      effects: { block: 10 },
      character: '玉麒麟 盧俊義',
      flavorText: '忠義の化身'
    },
    {
      id: nanoid(),
      name: '智将の采配',
      cost: 1,
      type: 'power',
      description: 'カードを2枚引く',
      effects: { draw: 2 },
      character: '智多星 呉用',
      flavorText: '知略の首領'
    },
    {
      id: nanoid(),
      name: '鉄槍術',
      cost: 1,
      type: 'attack',
      description: '6ダメージを2回与える',
      effects: { damage: 6 },
      character: '金槍手 徐寧',
      flavorText: '槍の達人'
    },
    {
      id: nanoid(),
      name: '忠義の誓い',
      cost: 0,
      type: 'skill',
      description: '手札のカード1枚のコストを0にする',
      effects: {},
      character: '赤髪鬼 劉唐',
      flavorText: '義に篤き豪傑'
    }
  ]

  // ランダムに3枚選ぶ
  return rewardCards
    .sort(() => Math.random() - 0.5)
    .slice(0, REWARD_CARDS_COUNT)
}

interface CardRewardProps {
  onSelectCard: (card: CardType) => void
  onSkip: () => void
}

const CardReward = ({ onSelectCard, onSkip }: CardRewardProps) => {
  const rewardCards = generateRewardCards()

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-xl border border-yellow-900/30 max-w-4xl w-full">
        <h2 className="text-2xl font-bold text-yellow-100 text-center mb-6">
          カードを1枚選択
        </h2>
        
        <div className="flex justify-center gap-6 mb-8">
          {rewardCards.map(card => (
            <div
              key={card.id}
              onClick={() => onSelectCard(card)}
              className="transform transition-transform hover:scale-105 cursor-pointer"
            >
              <Card {...card} />
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button
            onClick={onSkip}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300
                     transition-colors"
          >
            スキップ
          </button>
        </div>
      </div>
    </div>
  )
}

export default CardReward