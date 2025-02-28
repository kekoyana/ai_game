import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectCurrentScene,
  selectAffection,
  selectGameOver,
  chooseOption,
  resetGame,
} from '../features/gameSlice'
import Background from '../components/Background'
import Character from '../components/Character'
import MessageBox from '../components/MessageBox'
import Choices from '../components/Choices'
import './GamePage.css'

const GamePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentScene = useSelector(selectCurrentScene)
  const affection = useSelector(selectAffection)
  const gameOver = useSelector(selectGameOver)

  const handleChoice = (nextSceneId: string) => {
    dispatch(chooseOption(nextSceneId))
  }

  const handleRestart = () => {
    dispatch(resetGame())
  }

  const handleBackToTitle = () => {
    navigate('/')
  }

  return (
    <div className="game-page">
      <div className="game-upper">
        <Background location={currentScene.location} />
        <Character expression={currentScene.characterExpression} />
        <div className={`affection-meter${gameOver ? '' : ' pulse-animation'}`}>
          好感度: {affection} <span className="heart">❤️</span>
        </div>
      </div>

      <div className="game-lower">
        <MessageBox text={currentScene.text} />
        {!gameOver && currentScene.choices.length > 0 ? (
          <Choices choices={currentScene.choices} onSelect={handleChoice} />
        ) : (
          gameOver && (
            <div className="game-over-menu">
              <button onClick={handleRestart}>もう一度プレイ</button>
              <button onClick={handleBackToTitle}>タイトルに戻る</button>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default GamePage