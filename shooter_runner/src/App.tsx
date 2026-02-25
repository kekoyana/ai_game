import Game from './Game';

function App() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      overflow: 'hidden',
    }}>
      <Game />
    </div>
  );
}

export default App;
