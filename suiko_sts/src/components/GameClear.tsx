interface GameClearProps {
  onRestart: () => void
}

const GameClear = ({ onRestart }: GameClearProps) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-xl border border-yellow-900/30 max-w-2xl w-full
                    text-center space-y-6">
        <h2 className="text-4xl font-bold text-yellow-100 mb-4">
          Game Clear!
        </h2>
        
        <p className="text-xl text-gray-300">
          高俅を倒し、水滸伝の豪傑たちは勝利を手にしました！
        </p>

        <div className="text-5xl my-8 animate-bounce">
          🎉
        </div>
        
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-yellow-600 hover:bg-yellow-500 
                   rounded-lg text-white font-bold text-xl
                   transition-colors transform hover:scale-105"
        >
          新しい冒険を始める
        </button>
      </div>
    </div>
  )
}

export default GameClear