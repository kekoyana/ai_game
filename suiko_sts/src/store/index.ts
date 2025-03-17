import { configureStore } from '@reduxjs/toolkit'
import { enableMapSet } from 'immer'
import gameReducer from './slices/gameSlice'
import mapReducer from './slices/mapSlice'

// Enable support for Set objects in Immer
enableMapSet()

export const store = configureStore({
  reducer: {
    game: gameReducer,
    map: mapReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch