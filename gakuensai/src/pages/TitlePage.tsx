import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { resetGame } from '../features/gameSlice'
import Background from '../components/Background'
import './TitlePage.css'

const TitlePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleStart = () => {
    dispatch(resetGame())
    navigate('/game')
  }

  return (
    <div className="title-page">
      <Background location="ground" />
      <div className="title-content">
        <h1>学園祭の思い出</h1>
        <p>特別な一日が、あなたを待っている...</p>
        <button onClick={handleStart} className="start-button">
          ゲーム開始
        </button>
      </div>
    </div>
  )
}

export default TitlePage