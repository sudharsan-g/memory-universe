import { useState } from 'react'
import { motion } from 'framer-motion'
import Confetti from '../components/Confetti'

interface RoastGameProps {
  onBack: () => void
}

const roasts = {
  age: [
    "Look who just turned {age}... still younger than your jokes though!",
    "Congrats on being {age}! You're officially closer to 100 than to a good WiFi signal.",
    "{age} years old? I thought you said you were gonna retire already!",
    "Another year older, another year of pretending you understand TikTok.",
    "At {age}, you've earned the right to fall asleep anywhere.",
  ],
  life: [
    "You're still here? We didn't place bets on that...",
    "Proof that mistakes DO happen in life! Happy birthday anyway.",
    "Congratulations for another year of surviving your own decisions.",
    "You've made it to {age}! Your life choices are somehow working out.",
    "Another lap around the sun... Earth is tired.",
  ],
  appearance: [
    "Looking older every year! But in a distinguished way... sure, let's go with that.",
    "You're aging like fine wine... getting more wrinkly and expensive.",
    "Have you considered that candles aren't the only thing getting lit on your cake?",
    "Your birthday suit would need more wrinkle cream than your actual outfit.",
    "Gray hairs are just highlights from wisdom... or so we tell ourselves.",
  ],
}

export default function RoastGame({ onBack }: RoastGameProps) {
  const [age, setAge] = useState('')
  const [currentRoast, setCurrentRoast] = useState('')
  const [category, setCategory] = useState<keyof typeof roasts>('age')
  const [showRoast, setShowRoast] = useState(false)

  const generateRoast = () => {
    if (!age) {
      alert('Enter your age first, grandpa!')
      return
    }

    const roastArray = roasts[category]
    const randomRoast = roastArray[Math.floor(Math.random() * roastArray.length)]
    const finalRoast = randomRoast.replace('{age}', age)
    setCurrentRoast(finalRoast)
    setShowRoast(true)
  }

  return (
    <>
      <Confetti />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <button
          onClick={onBack}
          className="mb-6 text-white/80 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back
        </button>

        <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
          🔥 Roast Generator
        </h2>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 space-y-6">
          {/* Age Input */}
          <div>
            <label className="block text-white font-semibold mb-2">
              How old are you?
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age"
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-white font-semibold mb-3">
              Choose roast type:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['age', 'life', 'appearance'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat as keyof typeof roasts)}
                  className={`py-2 px-3 rounded-lg font-semibold transition-all ${
                    category === cat
                      ? 'bg-pink-500 text-white scale-105'
                      : 'bg-white/20 text-white/80 hover:bg-white/30'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateRoast}
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-lg hover:shadow-lg transition-all"
          >
            Generate Roast 🎯
          </motion.button>

          {/* Roast Display */}
          {showRoast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/20 rounded-lg p-5 border-2 border-pink-400"
            >
              <p className="text-white text-lg font-semibold">{currentRoast}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  )
}
