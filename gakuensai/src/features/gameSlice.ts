import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { GameState, Scene } from '../types/game'
import { INITIAL_SCENE, SCENARIOS, ENDING_SCENES } from '../constants/scenarios'

const initialState: GameState = {
  currentScene: INITIAL_SCENE,
  affection: 0,
  visitedLocations: [],
  gameOver: false,
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    chooseOption: (state, action: PayloadAction<string>) => {
      const nextSceneId = action.payload
      let nextScene: Scene | undefined

      // エンディング判定
      if (state.affection >= 10) {
        nextScene = ENDING_SCENES.good_ending
        state.gameOver = true
      } else if (state.visitedLocations.length >= 5 && state.affection >= 5) {
        nextScene = ENDING_SCENES.normal_ending
        state.gameOver = true
      } else if (state.visitedLocations.length >= 7 && state.affection < 5) {
        nextScene = ENDING_SCENES.bad_ending
        state.gameOver = true
      } else {
        nextScene = SCENARIOS[nextSceneId]
      }

      if (!nextScene) {
        return
      }

      // 新しい場所を訪れた場合、visitedLocationsに追加
      if (!state.visitedLocations.includes(nextScene.location)) {
        state.visitedLocations.push(nextScene.location)
      }

      // 選択による好感度の変更を適用
      const currentChoice = state.currentScene.choices.find(
        choice => choice.nextSceneId === nextSceneId
      )
      if (currentChoice?.effect) {
        state.affection += currentChoice.effect.affection
      }

      state.currentScene = nextScene
    },
    resetGame: (state) => {
      state.currentScene = INITIAL_SCENE
      state.affection = 0
      state.visitedLocations = []
      state.gameOver = false
    },
  },
})

export const { chooseOption, resetGame } = gameSlice.actions

export const selectCurrentScene = (state: RootState) => state.game.currentScene
export const selectAffection = (state: RootState) => state.game.affection
export const selectGameOver = (state: RootState) => state.game.gameOver

export default gameSlice.reducer