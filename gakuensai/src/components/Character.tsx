import React from 'react'
import { Expression } from '../types/game'

// Import all character expressions
import angry from '../assets/character/angry.webp'
import blush from '../assets/character/blush.webp'
import normal from '../assets/character/normal.webp'
import sad from '../assets/character/sad.webp'
import smile from '../assets/character/smile.webp'

const characterImages: Record<Expression, string> = {
  angry,
  blush,
  normal,
  sad,
  smile,
}

interface CharacterProps {
  expression: Expression
}

const Character: React.FC<CharacterProps> = ({ expression }) => {
  return (
    <div className="character">
      <img
        src={characterImages[expression]}
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