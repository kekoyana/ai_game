import { useState, useEffect } from 'react'
import './App.css'
import { Map } from './components/Map'
import { Room, Floor } from './types/school'
import { studentManager } from './data/studentData'
import { locationManager } from './managers/locationManager'
import { timeManager } from './managers/timeManager'
import { StatusModal } from './components/StatusModal'
import { Student } from './types/student'

function App() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [currentFloor, setCurrentFloor] = useState<Floor>(1);
  const [message, setMessage] = useState<string>('学校内を探索しましょう！');
  const [currentTime, setCurrentTime] = useState<string>(timeManager.getFormattedTime());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  useEffect(() => {
    async function initializeApp() {
      try {
        await studentManager.initialize();
        const students = studentManager.getAllStudents();
        
        locationManager.startPeriodicUpdate(students, 300);
        
        timeManager.addTimeListener(() => {
          setCurrentTime(timeManager.getFormattedTime());
        });

        setLoading(false);
      } catch (err) {
        setError('データの読み込みに失敗しました。');
        setLoading(false);
        console.error('Failed to initialize app:', err);
      }
    }

    initializeApp();

    return () => {
      locationManager.stopPeriodicUpdate();
    };
  }, []);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    
    const studentsInRoom = locationManager.getStudentsInRoom(room.id);
    let roomMessage = `${room.name}に移動しました。`;

    if (studentsInRoom.length > 0) {
      const studentNames = studentsInRoom
        .map(student => `${student.lastName}${student.firstName}`)
        .join('、');
      roomMessage += `\nここには${studentsInRoom.length}人の生徒がいます：\n${studentNames}`;
    } else {
      roomMessage += '\nここには誰もいません。';
    }

    timeManager.advanceTime(5);
    setMessage(roomMessage);
  };

  const handleFloorChange = (floor: Floor) => {
    setCurrentFloor(floor);
    timeManager.advanceTime(5);
    setMessage(`${typeof floor === 'number' ? floor + 'F' : floor}に移動しました。`);
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsStatusModalOpen(true);
  };

  const getFloorDisplay = (floor: Floor) => {
    if (floor === 'ground') return '校庭';
    if (floor === 'roof') return '屋上';
    return `${floor}F`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>データを読み込んでいます...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-layout">
        <div className="map-area">
          <div className="time-display">
            現在時刻: {currentTime}
          </div>
          <Map 
            onRoomClick={handleRoomClick}
            onFloorChange={handleFloorChange}
            currentFloor={currentFloor}
          />
        </div>
        <div className="status-area">
          <h2>現在の場所</h2>
          <div className="current-location">
            <p>フロア: {getFloorDisplay(currentFloor)}</p>
            {selectedRoom && (
              <p>場所: {selectedRoom.name}</p>
            )}
          </div>
          {selectedRoom && (
            <div className="room-info">
              <h3>この場所にいる生徒</h3>
              {locationManager.getStudentsInRoom(selectedRoom.id).length > 0 ? (
                <ul className="students-list">
                  {locationManager.getStudentsInRoom(selectedRoom.id).map(student => (
                    <li 
                      key={student.id}
                      onClick={() => handleStudentClick(student)}
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
          )}
        </div>
        <div className="message-area">
          <div className="message-content">{message}</div>
        </div>
      </div>

      {selectedStudent && (
        <StatusModal
          student={selectedStudent}
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  )
}

export default App
