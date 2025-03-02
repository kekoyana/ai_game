import { Room } from '../types/school'
import { Student } from '../types/student'
import { locationManager } from '../managers/locationManager'

import './RoomInfo.css'

interface RoomInfoProps {
  room: Room | null
  onStudentClick: (student: Student) => void
  isOpen: boolean
  onClose: () => void
}

export const RoomInfo = ({ room, onStudentClick, isOpen, onClose }: RoomInfoProps) => {
  if (!isOpen || !room) return null
  const studentsInRoom = locationManager.getStudentsInRoom(room.id)

  return (
    <div className="room-info-modal" onClick={onClose}>
      <div className="room-info-content" onClick={e => e.stopPropagation()}>
        <div className="room-info-header">
          <h3>{room.name}にいる生徒</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        {studentsInRoom.length > 0 ? (
          <ul className="students-list">
            {studentsInRoom.map(student => (
              <li
                key={student.id}
                onClick={() => onStudentClick(student)}
                className="student-item"
              >
                {student.lastName} {student.firstName}
                {student.isLeader && ' (リーダー)'}
              </li>
            ))}
          </ul>
        ) : (
          <p>誰もいません</p>
        )}
      </div>
    </div>
  )
}