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
          width: '400px',
          height: '500px',
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          pointerEvents: 'none',
          objectFit: 'contain'
        }}
      />
    </div>
  )
}

export default Character