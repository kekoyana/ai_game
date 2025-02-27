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
          height: '600px',
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}

export default Character