import { Provider } from 'react-redux'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { store } from './features/store'
import './App.css'
import TitlePage from './pages/TitlePage'
import GamePage from './pages/GamePage'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<TitlePage />} />
          <Route path="/game" element={<GamePage />} />
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
