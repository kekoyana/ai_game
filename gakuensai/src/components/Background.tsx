import { Location } from '../types/game'

interface BackgroundProps {
  location: Location
}

const Background: React.FC<BackgroundProps> = ({ location }) => {
  return (
    <div className="background">
      <img
        src={`/src/assets/background/${location}.jpg`}
        alt={`Location ${location}`}
        style={{
          width: '1024px',
          height: '768px',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}

export default Background