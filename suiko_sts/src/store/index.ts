import { configureStore } from '@reduxjs/toolkit'
import { enableMapSet } from 'immer'
import gameGeneralReducer from './slices/gameGeneralSlice'
import battleReducer from './slices/battleSlice'
import mapReducer from './slices/mapSlice'

// Enable support for Set objects in Immer
enableMapSet()

export const store = configureStore({
  reducer: {
    gameGeneral: gameGeneralReducer,
    battle: battleReducer,
    map: mapReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch