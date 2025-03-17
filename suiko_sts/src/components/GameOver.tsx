interface GameOverProps {
  onRestart: () => void
}

const GameOver = ({ onRestart }: GameOverProps) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-xl border border-red-900/30 max-w-2xl w-full
                    text-center space-y-6">
        <h2 className="text-4xl font-bold text-red-500 mb-4">
          Game Over
        </h2>
        
        <p className="text-xl text-gray-300">
          宋江は倒れ、梁山泊の野望は潰えた...
        </p>

        <div className="text-5xl my-8">
          💀
        </div>
        
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-red-600 hover:bg-red-500 
                   rounded-lg text-white font-bold text-xl
                   transition-colors transform hover:scale-105"
        >
          再挑戦する
        </button>
      </div>
    </div>
  )
}

export default GameOver