export type Location = 
  | 'bench'
  | 'classroom'
  | 'ground'
  | 'library_room'
  | 'park'
  | 'rooftop'
  | 'school_gym'
  | 'staircase'

export type Expression = 
  | 'smile'
  | 'sad'
  | 'normal'
  | 'blush'
  | 'angry'

export interface Choice {
  text: string
  nextSceneId: string
  effect?: {
    affection: number
  }
}

export interface Scene {
  id: string
  text: string
  characterExpression: Expression
  location: Location
  choices: Choice[]
}

export interface GameState {
  currentScene: Scene
  affection: number
  visitedLocations: Location[]
  gameOver: boolean
}