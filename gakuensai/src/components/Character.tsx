import { Expression } from '../types/game'

interface CharacterProps {
  expression: Expression
}

const Character: React.FC<CharacterProps> = ({ expression }) => {
  return (
    <div className="character">
      <img
        src={`/src/assets/character/${expression}.webp`}
        alt={`Character ${expression}`}
        style={{
          width: '480px',
          height: '640px',
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2
        }}
      />
    </div>
  )
}

export default Character