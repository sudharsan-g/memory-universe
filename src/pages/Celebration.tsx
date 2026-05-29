import { useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "../components/Confetti";

interface CelebrationProps {
  onNext: () => void;
}

export default function Celebration({ onNext }: CelebrationProps) {
  useEffect(() => {
    const timer = setTimeout(onNext, 5000);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <>
      <Confetti />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex flex-col items-center justify-center w-full min-h-screen px-4"
      >
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="mb-8"
        ></motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="mb-8 w-full max-w-sm md:max-w-md"
        >
          <img
            src="https://media1.tenor.com/m/5JXxGXlw9nUAAAAd/cool-fun.gif"
            alt="Celebrating cat"
            className="w-full rounded-lg shadow-2xl"
          />
        </motion.div>
      </motion.div>
    </>
  );
}
