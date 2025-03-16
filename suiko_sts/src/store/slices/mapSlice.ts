import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MapLevel, initialMap } from '../../data/mapNodes'

interface MapState {
  currentMap: MapLevel
  currentNodeId: string
  visitedNodes: string[] // 配列として保存
  clearedNodes: string[] // 配列として保存
  availableNodes: string[] // 配列として保存
}

const initialState: MapState = {
  currentMap: initialMap,
  currentNodeId: initialMap.startNodeId,
  visitedNodes: [initialMap.startNodeId],
  clearedNodes: [initialMap.startNodeId],
  availableNodes: initialMap.nodes.find(n => n.id === initialMap.startNodeId)?.connections || []
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

      // クリア後の移動可能なノードを設定
      state.availableNodes = node.connections
    },

    resetMap: (state) => {
      state.currentNodeId = state.currentMap.startNodeId
      state.visitedNodes = [state.currentMap.startNodeId]
      state.clearedNodes = [state.currentMap.startNodeId]
      state.availableNodes = 
        state.currentMap.nodes.find(n => n.id === state.currentMap.startNodeId)?.connections || []
    }
  }
})

export const { moveToNode, clearNode, resetMap } = mapSlice.actions

export default mapSlice.reducer