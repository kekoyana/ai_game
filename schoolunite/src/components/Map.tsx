import { Floor, Room } from '../types/school';
import { schoolRooms } from '../data/schoolData';
import './Map.css';

interface MapProps {
  onRoomClick: (room: Room) => void;
  onFloorChange: (floor: Floor) => void;
  currentFloor: Floor;
}

const GRID_SIZE = 80; // グリッドの1マスのサイズ（ピクセル）を小さくして調整

export function Map({ onRoomClick, onFloorChange, currentFloor }: MapProps) {
  const getRoomStyle = (room: Room) => {
    return {
      left: `${room.x * GRID_SIZE}px`,
      top: `${room.y * GRID_SIZE}px`,
      width: `${room.width * GRID_SIZE - 4}px`,
      height: `${room.height * GRID_SIZE - 4}px`,
    };
  };

  const handleRoomClick = (room: Room) => {
    if ((room.type === 'upstairs' || room.type === 'downstairs') && room.targetFloor) {
      onFloorChange(room.targetFloor);
      onRoomClick(room);
    } else if (room.type === 'entrance' && currentFloor === 1) {
      onFloorChange('ground');
      onRoomClick(room);
    } else if (room.type === 'schoolgate' && currentFloor === 'ground') {
      onFloorChange(1);
      onRoomClick(room);
    } else {
      onRoomClick(room);
    }
  };

  const currentRooms = schoolRooms.filter(room => room.floor === currentFloor);

  return (
    <div className="map-container">
      <div className="floor-map">
        <div className="rooms-container">
          {currentRooms.map(room => (
            <div
              key={room.id}
              className={`room ${room.type}`}
              style={getRoomStyle(room)}
              onClick={() => handleRoomClick(room)}
              title={room.name}
            >
              <span className="room-name">{room.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}