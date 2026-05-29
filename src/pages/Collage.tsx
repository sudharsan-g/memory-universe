import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import image1 from "../assets/1.png";
import image2 from "../assets/IMG_2891.mp4";
import img3 from "../assets/IMG_2909.jpg";
import img4 from "../assets/old.jpg";
import img5 from "../assets/old2.jpg";
import img6 from "../assets/IMG_2912.mp4";
import img7 from "../assets/IMG_2919.mp4";
import img8 from "../assets/new1.jpeg";
import music from "../assets/dheema_instrumental_bgm.mp3";

interface CollageProps {
  onNext: () => void;
}

const mediaItems = [
  {
    type: "image",
    src: image1,
    alt: "Happy moment",
  },
  {
    type: "video",
    src: image2,
    alt: "Birthday chaos 🎂",
  },
  {
    type: "image",
    src: img3,
    alt: "Cute memories ✨",
  },
  {
    type: "image",
    src: img4,
    alt: "Vintage vibes 📸",
  },
  {
    type: "video",
    src: img7,
    alt: "Latest memories 📸",
  },
  {
    type: "image",
    src: img5,
    alt: "Core memories ❤️",
  },
  {
    type: "image",
    src: img8,
    alt: "New memories 📸",
  },
  {
    type: "video",
    src: img6,
    alt: "Fun times 😂",
  },
];

export default function Collage({ onNext }: CollageProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [canSkip, setCanSkip] = useState(false);
  const [started, setStarted] = useState(false);

  /* -----------------------------
     START MEDIA AFTER FIRST TAP
  ----------------------------- */

  useEffect(() => {
    const startExperience = async () => {
      if (started) return;

      setStarted(true);

      // PLAY AUDIO
      if (audioRef.current) {
        audioRef.current.volume = 0.3;

        try {
          await audioRef.current.play();
        } catch (err) {
          console.log(err);
        }
      }

      // PLAY ALL VIDEOS
      const videos = document.querySelectorAll("video");

      videos.forEach(async (video) => {
        try {
          video.muted = true;
          video.playsInline = true;

          await video.play();
        } catch (err) {
          console.log(err);
        }
      });
    };

    window.addEventListener("touchstart", startExperience, {
      once: true,
    });

    window.addEventListener("click", startExperience, {
      once: true,
    });

    return () => {
      window.removeEventListener("touchstart", startExperience);
      window.removeEventListener("click", startExperience);
    };
  }, [started]);

  /* -----------------------------
     TIMERS
  ----------------------------- */

  useEffect(() => {
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 3000);

    const autoNext = setTimeout(() => {
      onNext();
    }, 15000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(autoNext);
    };
  }, [onNext]);

  /* -----------------------------
     AUTO SCROLL DOWN
  ----------------------------- */

  useEffect(() => {
    const container = document.getElementById("collage-container");

    if (!container) return;

    let animationFrame: number;

    const autoScroll = () => {
      container.scrollTop += 0.7;

      animationFrame = requestAnimationFrame(autoScroll);
    };

    animationFrame = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div
      id="collage-container"
      className="
        w-full
        h-screen
        overflow-y-auto
        no-scrollbar
        bg-gradient-to-br
        from-blue-600
        via-purple-600
        to-pink-600
      "
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Background Music */}
      <audio ref={audioRef} loop playsInline preload="auto" src={music} />

      {/* Main Content */}
      <div className="min-h-screen flex flex-col items-center px-4 py-10">
        {/* Heading */}
        <motion.div
          initial={{
            opacity: 0,
            y: -40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
          }}
          className="text-center mb-10"
        >
          <h1
            className="
              text-4xl
              md:text-6xl
              font-black
              text-white
              drop-shadow-2xl
            "
          >
            Memory Universe
          </h1>

          <p className="text-white/70 mt-3 text-lg">
            scrolling through chaos...
          </p>
        </motion.div>

        {/* Masonry Collage */}
        <div
          className="
            columns-2
            md:columns-3
            gap-4
            space-y-4
            max-w-6xl
            w-full
          "
        >
          {mediaItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
              }}
              whileHover={{
                scale: 1.03,
              }}
              className="
                relative
                overflow-hidden
                rounded-[28px]
                shadow-2xl
                bg-white/10
                backdrop-blur-md
                border
                border-white/20
                break-inside-avoid
                mb-4
              "
            >
              {item.type === "image" ? (
                <motion.img
                  src={item.src}
                  alt={item.alt}
                  className="w-full object-cover"
                  whileHover={{
                    scale: 1.08,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                />
              ) : (
                <motion.video
                  src={item.src}
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="auto"
                  webkit-playsinline="true"
                  className="w-full object-cover"
                  whileHover={{
                    scale: 1.05,
                  }}
                />
              )}

              {/* Overlay */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/70
                  via-black/10
                  to-transparent
                "
              />

              {/* Text */}
              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  p-4
                "
              >
                <p
                  className="
                    text-white
                    font-bold
                    text-lg
                    drop-shadow-lg
                  "
                >
                  {item.alt}
                </p>

                <p className="text-white/70 text-sm">memory unlocked ✨</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Space */}
        <div className="h-32" />
      </div>

      {/* TAP OVERLAY */}
      {!started && (
        <div
          className="
            fixed
            inset-0
            z-[999]
            flex
            items-center
            justify-center
            bg-black/60
            backdrop-blur-sm
          "
        >
          <div className="text-center text-white px-6">
            <h2 className="text-3xl font-black mb-4">Tap to Enter ✨</h2>

            <p className="text-white/70">music + memories are waiting...</p>
          </div>
        </div>
      )}

      {/* Next Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: canSkip ? 1 : 0,
        }}
        className="
          fixed
          bottom-6
          left-1/2
          -translate-x-1/2
          z-50
        "
      >
        <button
          onClick={onNext}
          className="
            px-8
            py-4
            rounded-full
            bg-white
            text-purple-700
            font-bold
            shadow-2xl
            hover:scale-105
            transition-all
          "
        >
          Continue 🎮
        </button>
      </motion.div>
    </div>
  );
}
