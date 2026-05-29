import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Confetti from '../components/Confetti'

interface MemoryGameProps {
  onBack: () => void
}

const memories = [
  { id: 1, emoji: '🎂', label: 'Birthday Cake' },
  { id: 2, emoji: '🎉', label: 'Party' },
  { id: 3, emoji: '🎈', label: 'Balloons' },
  { id: 4, emoji: '🎁', label: 'Gifts' },
  { id: 5, emoji: '🕯️', label: 'Candles' },
  { id: 6, emoji: '🎪', label: 'Fun' },
]

interface Card {
  id: number
  emoji: string
  label: string
  matched: boolean
}

const createCards = () =>
  [...memories, ...memories]
    .sort(() => Math.random() - 0.5)
    .map((card, index) => ({ ...card, id: index, matched: false }))

export default function MemoryGame({ onBack }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>(createCards)
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const gameWon = matched.length === cards.length && cards.length > 0

  const initializeGame = () => {
    setCards(createCards())
    setFlipped([])
    setMatched([])
    setMoves(0)
  }

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped
      const timer = window.setTimeout(
        () => {
          if (cards[first].emoji === cards[second].emoji) {
            setMatched((current) => [...current, first, second])
          }

          setFlipped([])
          setMoves((m) => m + 1)
        },
        cards[first].emoji === cards[second].emoji ? 0 : 800,
      )

      return () => window.clearTimeout(timer)
    }
  }, [cards, flipped])

  const toggleFlip = (index: number) => {
    if (flipped.includes(index) || matched.includes(index) || flipped.length === 2) {
      return
    }
    setFlipped([...flipped, index])
  }

  const isFlipped = (index: number) => flipped.includes(index) || matched.includes(index)

  return (
    <>
      {gameWon && <Confetti />}
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

        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
            🧠 Memory Match
          </h2>
          <p className="text-white/80">Find matching pairs!</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          {/* Stats */}
          <div className="flex justify-between text-white mb-6">
            <div>
              <p className="text-sm text-white/70">Moves</p>
              <p className="text-2xl font-bold">{moves}</p>
            </div>
            <div>
              <p className="text-sm text-white/70">Matched</p>
              <p className="text-2xl font-bold">{matched.length / 2} / {cards.length / 2}</p>
            </div>
          </div>

          {/* Game Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {cards.map((card, index) => (
              <motion.button
                key={index}
                onClick={() => toggleFlip(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isFlipped(index) ? { rotateY: 0 } : { rotateY: 180 }}
                transition={{ duration: 0.6 }}
                className={`aspect-square rounded-lg font-bold text-3xl transition-all ${
                  isFlipped(index)
                    ? 'bg-gradient-to-br from-purple-400 to-pink-400'
                    : 'bg-gradient-to-br from-blue-400 to-purple-400 hover:shadow-lg'
                }`}
              >
                {isFlipped(index) ? card.emoji : '?'}
              </motion.button>
            ))}
          </div>

          {/* Win Message */}
          {gameWon && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <p className="text-white text-2xl font-bold mb-4">
                🎉 You Won! 🎉
              </p>
              <p className="text-white/80 mb-4">Completed in {moves} moves!</p>
            </motion.div>
          )}

          {/* Restart Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={initializeGame}
            className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded-lg hover:shadow-lg transition-all"
          >
            {gameWon ? 'Play Again' : 'Reset'} 🔄
          </motion.button>
        </div>
      </motion.div>
    </>
  )
}
