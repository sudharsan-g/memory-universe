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
  const containerRef = useRef<HTMLDivElement>(null);

  const [canSkip, setCanSkip] = useState(false);
  const [started, setStarted] = useState(false);

  /* -----------------------------
     START EVERYTHING AFTER TAP
  ----------------------------- */

  useEffect(() => {
    if (!started) return;

    let animationFrame: number;

    const startEverything = async () => {
      try {
        /* AUDIO */
        if (audioRef.current) {
          audioRef.current.volume = 0.3;

          try {
            await audioRef.current.play();
          } catch (e) {
            console.log(e);
          }
        }

        /* VIDEOS */
        const videos = document.querySelectorAll("video");

        videos.forEach(async (video) => {
          try {
            video.muted = true;
            video.defaultMuted = true;
            video.playsInline = true;
            video.autoplay = true;
            video.loop = true;

            await video.play();
          } catch (e) {
            console.log(e);
          }
        });

        /* AUTO SCROLL */
        const container = containerRef.current;

        if (!container) return;

        let scrollAmount = 0;

        const autoScroll = () => {
          scrollAmount += 0.7;

          container.scrollTo({
            top: scrollAmount,
            behavior: "smooth",
          });

          animationFrame = requestAnimationFrame(autoScroll);
        };

        autoScroll();
      } catch (err) {
        console.log(err);
      }
    };

    startEverything();

    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 3000);

    const autoNext = setTimeout(() => {
      onNext();
    }, 15000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(autoNext);

      cancelAnimationFrame(animationFrame);
    };
  }, [started, onNext]);

  return (
    <div
      ref={containerRef}
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
        bg-fixed
      "
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* ENTER OVERLAY */}
      {!started && (
        <div
          className="
            fixed
            inset-0
            z-[999]
            flex
            items-center
            justify-center
            bg-black/70
            backdrop-blur-md
          "
          onClick={() => setStarted(true)}
          onTouchStart={() => setStarted(true)}
        >
          <motion.button
            initial={{
              scale: 0.9,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            className="
              px-10
              py-5
              rounded-full
              bg-white
              text-purple-700
              font-black
              text-xl
              shadow-2xl
            "
          >
            Tap to Enter ✨
          </motion.button>
        </div>
      )}

      {/* AUDIO */}
      <audio ref={audioRef} src={music} loop preload="auto" playsInline />

      {/* MAIN CONTENT */}
      <div className="min-h-screen flex flex-col items-center px-4 py-10">
        {/* HEADING */}
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

        {/* COLLAGE */}
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
              "
            >
              {/* IMAGE */}
              {item.type === "image" ? (
                <motion.img
                  src={item.src}
                  alt={item.alt}
                  className="
                    w-full
                    object-cover
                  "
                  whileHover={{
                    scale: 1.08,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                />
              ) : (
                /* VIDEO */
                <motion.video
                  src={item.src}
                  muted
                  autoPlay
                  loop
                  className="
                    w-full
                    object-cover
                  "
                  webkit-playsinline="true"
                  whileHover={{
                    scale: 1.05,
                  }}
                />
              )}

              {/* OVERLAY */}
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

              {/* TEXT */}
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

        {/* SPACE */}
        <div className="h-32" />
      </div>

      {/* NEXT BUTTON */}
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
