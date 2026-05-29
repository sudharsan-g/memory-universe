import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import image23 from "../assets/23.jpg";

interface PersonalPageProps {
  onNext: () => void;
}

type TextState = "birthday" | "china" | "takkali" | "beaten" | "pooja" | "done";

export default function PersonalPage({ onNext }: PersonalPageProps) {
  const [textState, setTextState] = useState<TextState>("birthday");

  useEffect(() => {
    const timings = {
      birthday: 3000,
      china: 3000,
      takkali: 3000,
      beaten: 2000,
      pooja: 3000,
      done: 1000,
    };

    const stateSequence: TextState[] = [
      "birthday",
      "china",
      "takkali",
      "beaten",
      "pooja",
      "done",
    ];
    let currentIndex = 0;

    const timer = setInterval(() => {
      if (currentIndex < stateSequence.length - 1) {
        currentIndex++;
        setTextState(stateSequence[currentIndex]);
      } else {
        clearInterval(timer);
        setTimeout(onNext, 2000);
      }
    }, timings[stateSequence[currentIndex]]);

    return () => clearInterval(timer);
  }, [onNext]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Image */}
      <motion.img
        src={image23}
        alt="Celebration"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-0 left-0 w-full h-full object-cover opacity-30 pointer-events-none"
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl">
        {/* Animated Character */}
        <motion.div
          animate={
            textState === "beaten"
              ? {
                  x: [0, -30, 30, -30, 0],
                  rotate: [0, -10, 10, -10, 0],
                  opacity: [1, 1, 1, 0],
                }
              : { y: [0, -10, 0] }
          }
          transition={
            textState === "beaten"
              ? { duration: 0.8, repeat: 1 }
              : { duration: 0.5, repeat: Infinity }
          }
          className="text-8xl md:text-9xl"
        >
          🤖
        </motion.div>

        {/* Stone Animation - appears during beaten state */}
        <AnimatePresence>
          {textState === "beaten" && (
            <motion.div
              initial={{ x: 300, y: -100, rotate: 0 }}
              animate={{ x: -100, y: 150, rotate: 45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute text-6xl"
            >
              🪨
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Display */}
        <div className="h-32 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {textState === "birthday" && (
              <motion.div
                key="birthday"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-3">
                  Once again,
                </p>
                <p className="text-5xl md:text-6xl font-black text-yellow-300 drop-shadow-lg animate-pulse">
                  Happy Birthday!
                </p>
              </motion.div>
            )}

            {textState === "china" && (
              <motion.div
                key="china"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="text-5xl md:text-6xl font-black text-red-300 drop-shadow-lg">
                  China karri 🪭
                </p>
              </motion.div>
            )}

            {textState === "takkali" && (
              <motion.div
                key="takkali"
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 10 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="text-5xl md:text-6xl font-black text-orange-300 drop-shadow-lg">
                  Takkali Mukki 🍅
                </p>
              </motion.div>
            )}

            {textState === "pooja" && (
              <motion.div
                key="pooja"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="text-5xl md:text-6xl font-black text-white drop-shadow-lg animate-bounce">
                  Pooja ✨
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fun Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: textState === "done" ? 1 : 0 }}
          className="text-2xl text-white font-bold text-center drop-shadow-lg"
        >
          Hope you have a blast! 🎉
        </motion.p>
      </div>
    </div>
  );
}
