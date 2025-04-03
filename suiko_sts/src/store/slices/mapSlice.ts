import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MapLevel, initialMap, generateMap } from '../../data/mapNodes'
import type { RootState } from '../index'

interface MapState {
  currentMap: MapLevel
  currentNodeId: string
  currentStage: number
  visitedNodes: string[]
  clearedNodes: string[]
  availableNodes: string[]
  consumedNodes: string[]
  isGameCompleted: boolean
}

const initialState: MapState = {
  currentMap: initialMap,
  currentNodeId: initialMap.startNodeId,
  currentStage: 1,
  visitedNodes: [initialMap.startNodeId],
  clearedNodes: [initialMap.startNodeId],
  availableNodes: initialMap.nodes.find(n => n.id === initialMap.startNodeId)?.connections || [],
  consumedNodes: [],
  isGameCompleted: false
}

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    moveToNode: (state, action: PayloadAction<string>) => {
      const targetNodeId = action.payload
      const targetNode = state.currentMap.nodes.find(n => n.id === targetNodeId)
      
      if (!targetNode || !state.availableNodes.includes(targetNodeId)) {
        return
      }

      // 現在のノードを更新
      state.currentNodeId = targetNodeId
      if (!state.visitedNodes.includes(targetNodeId)) {
        state.visitedNodes.push(targetNodeId)
      }

      // 移動可能なノードを更新
      if (targetNode.type !== 'enemy' && targetNode.type !== 'elite' && targetNode.type !== 'boss') {
        // 戦闘ノード以外は自動的にクリア扱い
        if (!state.clearedNodes.includes(targetNodeId)) {
          state.clearedNodes.push(targetNodeId)
        }
        state.availableNodes = targetNode.connections
      } else {
        // 戦闘ノードは戦闘をクリアするまで先に進めない
        state.availableNodes = []
      }
    },

    clearNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload
      const node = state.currentMap.nodes.find(n => n.id === nodeId)
      
      if (!node) {
        return
      }

      // ノードをクリア済みにする
      if (!state.clearedNodes.includes(nodeId)) {
        state.clearedNodes.push(nodeId)
      }

      // 効果を使用済みのノードとして記録
      if (node.type === 'rest' || node.type === 'item' || node.type === 'shop') {
        if (!state.consumedNodes.includes(nodeId)) {
          state.consumedNodes.push(nodeId)
        }
      }

      // 戦闘ノードも消費済みにする
      if (node.type === 'enemy' || node.type === 'elite' || node.type === 'boss') {
        if (!state.consumedNodes.includes(nodeId)) {
          state.consumedNodes.push(nodeId)
        }
      }

      // ボスノードをクリアした場合の処理
      if (node.type === 'boss') {
        if (state.currentStage < 3) {
          // 次のステージへ進む
          const nextStage = state.currentStage + 1
          const newMap = generateMap(nextStage)
          state.currentMap = newMap
          state.currentStage = nextStage
          state.currentNodeId = newMap.startNodeId
          state.visitedNodes = [newMap.startNodeId]
          state.clearedNodes = [newMap.startNodeId]
          state.availableNodes = newMap.nodes.find(n => n.id === newMap.startNodeId)?.connections || []
          state.consumedNodes = []
        } else {
          // ゲームクリア
          state.isGameCompleted = true
          state.availableNodes = []
        }
      } else {
        // 通常ノードのクリア後の移動可能なノードを設定
        state.availableNodes = node.connections
      }
    },

    resetMap: (state) => {
      // ゲームを最初から開始
      const newMap = generateMap(1)
      state.currentMap = newMap
      state.currentStage = 1
      state.currentNodeId = newMap.startNodeId
      state.visitedNodes = [newMap.startNodeId]
      state.clearedNodes = [newMap.startNodeId]
      state.availableNodes = newMap.nodes.find(n => n.id === newMap.startNodeId)?.connections || []
      state.consumedNodes = []
      state.isGameCompleted = false
    }
  }
})

// セレクター
export const selectIsNodeConsumed = (state: RootState, nodeId: string) => 
  state.map.consumedNodes.includes(nodeId)

export const selectCurrentStage = (state: RootState) => state.map.currentStage
export const selectIsGameCompleted = (state: RootState) => state.map.isGameCompleted

export const { moveToNode, clearNode, resetMap } = mapSlice.actions

export default mapSlice.reducer