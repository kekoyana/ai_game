import { Floor, Room, AccessLevel } from '../types/school';
import { schoolRooms } from '../data/schoolData';
import './Map.css';

interface MapProps {
  onRoomClick: (room: Room) => void;
  onFloorChange: (floor: Floor) => void;
  currentFloor: Floor;
}

const GRID_SIZE = 80;

export function Map({ onRoomClick, onFloorChange, currentFloor }: MapProps) {
  const getRoomStyle = (room: Room) => {
    return {
      left: `${room.x * GRID_SIZE}px`,
      top: `${room.y * GRID_SIZE}px`,
      width: `${room.width * GRID_SIZE - 4}px`,
      height: `${room.height * GRID_SIZE - 4}px`,
    };
  };

  const isAccessibleFromCurrent = (room: Room, rooms: Room[]): boolean => {
    if (!room.requiredFromCorridor) return true;

    // 現在のフロアの廊下を取得
    const corridor = rooms.find(r => 
      r.floor === currentFloor && 
      r.type === 'corridor'
    );

    if (!corridor) return false;

    // 廊下に隣接しているかチェック
    const roomLeft = room.x;
    const roomRight = room.x + room.width;
    const roomTop = room.y;
    const roomBottom = room.y + room.height;
    
    const corridorLeft = corridor.x;
    const corridorRight = corridor.x + corridor.width;
    const corridorTop = corridor.y;
    const corridorBottom = corridor.y + corridor.height;

    // 廊下と部屋が接しているかチェック
    return (
      // 左側で接している
      (roomRight === corridorLeft && 
        !(roomBottom < corridorTop || roomTop > corridorBottom)) ||
      // 右側で接している
      (roomLeft === corridorRight && 
        !(roomBottom < corridorTop || roomTop > corridorBottom)) ||
      // 上側で接している
      (roomBottom === corridorTop && 
        !(roomRight < corridorLeft || roomLeft > corridorRight)) ||
      // 下側で接している
      (roomTop === corridorBottom && 
        !(roomRight < corridorLeft || roomLeft > corridorRight))
    );
  };

  const handleRoomClick = (room: Room) => {
    // 立入禁止の部屋はクリック不可
    if (room.accessLevel === AccessLevel.FORBIDDEN) {
      return;
    }

    // 階段、昇降口、正門は常にアクセス可能
    const alwaysAccessible = [
      'upstairs', 'downstairs', 'entrance', 'schoolgate'
    ].includes(room.type);

    // 廊下からのアクセスが必要な部屋をチェック
    if (!alwaysAccessible && room.requiredFromCorridor && !isAccessibleFromCurrent(room, currentRooms)) {
      return;
    }

    // 階層移動の処理
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
              data-access={AccessLevel[room.accessLevel]}
              title={`${room.name}${room.accessLevel > AccessLevel.FREE ? ' (立入制限あり)' : ''}`}
            >
              <span className="room-name">{room.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}