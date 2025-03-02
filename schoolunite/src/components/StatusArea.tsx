import { Student } from '../types/student'
import { Room, Floor } from '../types/school'
import { studentManager } from '../data/studentData'
import { locationManager } from '../managers/locationManager'

interface StatusAreaProps {
  currentFloor: Floor
  selectedRoom: Room | null
  onStudentClick: (student: Student) => void
  onPlayerDetailsClick: () => void
}

export const StatusArea = ({
  currentFloor,
  selectedRoom,
  onStudentClick,
  onPlayerDetailsClick
}: StatusAreaProps) => {
  const getFloorDisplay = (floor: Floor) => {
    if (floor === 'ground') return '校庭'
    if (floor === 'roof') return '屋上'
    return `${floor}F`
  }

  return (
    <div className="status-area">
      <div className="player-status">
        <h2>主人公のステータス</h2>
        {(() => {
          const player = studentManager.getPlayer()
          if (!player) return null
          const hpPercentage = studentManager.getHpPercentage(player.id)
          
          return (
            <div className="player-info">
              <p className="player-name">{player.lastName} {player.firstName}</p>
              <div className="hp-bar">
                <div
                  className="hp-bar-fill"
                  style={{ width: `${hpPercentage}%` }}
                />
                <span className="hp-text">{hpPercentage}%</span>
              </div>
              <button
                className="details-button"
                onClick={onPlayerDetailsClick}
                style={{ marginTop: '10px' }}
              >
                詳細を表示
              </button>
            </div>
          )
        })()}
      </div>

      <div className="current-location">
       <h2>現在の場所</h2>
       <p>フロア: {getFloorDisplay(currentFloor)}</p>
       {selectedRoom && (
         <p>場所: {selectedRoom.name}</p>
       )}
     </div>
    </div>
  )
}