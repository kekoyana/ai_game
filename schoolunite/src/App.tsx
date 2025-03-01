import { useState } from 'react'
import './App.css'
import { Map } from './components/Map'
import { Room, Floor } from './types/school'

function App() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [currentFloor, setCurrentFloor] = useState<Floor>(1);
  const [message, setMessage] = useState<string>('学校内を探索しましょう！');

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    
    if (room.type === 'upstairs' && room.targetFloor) {
      setMessage(`上の階に移動します。`);
    } else if (room.type === 'downstairs' && room.targetFloor) {
      setMessage(`下の階に移動します。`);
    } else if (room.type === 'entrance' && currentFloor === 1) {
      setMessage('校庭に出ました。');
    } else if (room.type === 'schoolgate' && currentFloor === 'ground') {
      setMessage('校内に戻ります。');
    } else {
      setMessage(`${room.name}に移動しました。`);
    }
  };

  const handleFloorChange = (floor: Floor) => {
    setCurrentFloor(floor);
  };

  const getFloorDisplay = (floor: Floor) => {
    if (floor === 'ground') return '校庭';
    return `${floor}F`;
  };

  return (
    <div className="game-container">
      <div className="game-layout">
        <div className="map-area">
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
          <div className="movement-info">
            {selectedRoom?.type === 'upstairs' && selectedRoom.targetFloor && (
              <p>↑ {selectedRoom.targetFloor}Fへ上がれます</p>
            )}
            {selectedRoom?.type === 'downstairs' && selectedRoom.targetFloor && (
              <p>↓ {selectedRoom.targetFloor}Fへ下りれます</p>
            )}
          </div>
        </div>
        <div className="message-area">
          <div className="message-content">{message}</div>
        </div>
      </div>
    </div>
  )
}

export default App
