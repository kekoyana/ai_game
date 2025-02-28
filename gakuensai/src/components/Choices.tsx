import { Choice } from '../types/game'
import './Choices.css'

interface ChoicesProps {
  choices: Choice[]
  onSelect: (nextSceneId: string) => void
}

const Choices: React.FC<ChoicesProps> = ({ choices, onSelect }) => {
  return (
    <div className="choices-container">
      {choices.map((choice, index) => (
        <button
          key={index}
          onClick={() => onSelect(choice.nextSceneId)}
          className="choice-button"
        >
          {choice.text}
        </button>
      ))}
    </div>
  )
}

export default Choices