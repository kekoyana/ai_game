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
          width: '100%',
          height: '100vh',
          objectFit: 'cover',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      />
    </div>
  )
}

export default Background