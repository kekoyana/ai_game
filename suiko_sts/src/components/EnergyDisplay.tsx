interface EnergyDisplayProps {
  current: number
  max: number
}

const EnergyDisplay = ({ current, max }: EnergyDisplayProps) => (
  <div className="energy-crystal relative group">
    <div className="absolute -inset-1 bg-blue-500 rounded-full blur-sm opacity-75"></div>
    <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 
                    rounded-full w-full h-full flex items-center justify-center 
                    text-white font-bold text-xl border border-blue-300">
      {current}/{max}
    </div>
  </div>
)

export default EnergyDisplay