import { Relic } from '../data/relics'
import './RelicDisplay.css'

interface RelicDisplayProps {
  relics: Relic[]
}

const RelicDisplay = ({ relics }: RelicDisplayProps) => {
  if (relics.length === 0) return null

  return (
    <div className="relic-display">
      <h3 className="relic-title">所持お宝</h3>
      <div className="relic-list">
        {relics.map((relic) => (
          <div
            key={relic.id}
            className="relic-item"
            title={`${relic.name}\n${relic.description}`}
          >
            <span className="relic-icon">{relic.image}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RelicDisplay
