import React from 'react'
import { Location } from '../types/game'

// Import all background images
import bench from '../assets/background/bench.jpg'
import classroom from '../assets/background/classroom.jpg'
import ground from '../assets/background/ground.jpg'
import library_room from '../assets/background/library_room.jpg'
import park from '../assets/background/park.jpg'
import rooftop from '../assets/background/rooftop.jpg'
import school_gym from '../assets/background/school_gym.jpg'
import staircase from '../assets/background/staircase.jpg'

const backgroundImages: Record<Location, string> = {
  bench,
  classroom,
  ground,
  library_room,
  park,
  rooftop,
  school_gym,
  staircase,
}

interface BackgroundProps {
  location: Location
}

const Background: React.FC<BackgroundProps> = ({ location }) => {
  return (
    <div className="background">
      <img
        src={backgroundImages[location]}
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