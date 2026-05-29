import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface HomeProps {
  onNavigate: (page: "celebration" | "roast" | "memory") => void;
}

type MicStatus = "idle" | "asking" | "listening" | "blocked" | "blown";

const svgCandles = [
  { left: 39, height: 50, delay: 0 },
  { left: 47, height: 62, delay: 0.12 },
  { left: 55, height: 54, delay: 0.22 },
  { left: 63, height: 60, delay: 0.08 },
];

export default function Home({ onNavigate }: HomeProps) {
  const [countdown, setCountdown] = useState(3);
  const [micStatus, setMicStatus] = useState<MicStatus>("idle");
  const [showNudge, setShowNudge] = useState(false);
  const [isBlown, setIsBlown] = useState(false);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const blowFramesRef = useRef(0);

  const finishBlow = useCallback(() => {
    setIsBlown(true);
    setMicStatus("blown");
    setShowNudge(false);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close();

    window.setTimeout(() => onNavigate("celebration"), 1400);
  }, [onNavigate]);

  const startListening = useCallback(async () => {
    if (micStatus === "asking" || micStatus === "listening" || isBlown) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus("blocked");
      setShowNudge(true);
      return;
    }

    try {
      setMicStatus("asking");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const data = new Uint8Array(analyser.fftSize);

      analyser.fftSize = 1024;
      microphone.connect(analyser);
      streamRef.current = stream;
      audioContextRef.current = audioContext;
      setMicStatus("listening");

      const listenForBlow = () => {
        analyser.getByteTimeDomainData(data);

        let total = 0;

        for (const sample of data) {
          const centered = sample - 128;
          total += centered * centered;
        }

        // RMS volume
        const volume = Math.sqrt(total / data.length);

        /**
         * Better detection:
         *
         * Normal room noise:
         * 2 - 15
         *
         * Talking:
         * 20 - 45
         *
         * Real blowing:
         * 55+
         */

        const isBlowing = volume > 40;

        if (isBlowing) {
          blowFramesRef.current += 1;
        } else {
          blowFramesRef.current = 0;
        }

        /**
         * Need continuous blowing
         * for multiple frames
         */
        if (blowFramesRef.current > 185 && !isBlown) {
          setShowNudge(true);
        }
        if (blowFramesRef.current >= 200) {
          finishBlow();
          return;
        }

        animationRef.current = requestAnimationFrame(listenForBlow);
      };

      listenForBlow();
    } catch {
      setMicStatus("blocked");
      setShowNudge(true);
    }
  }, [finishBlow, isBlown, micStatus]);

  useEffect(() => {
    if (countdown <= 0) {
      const timer = window.setTimeout(startListening, 0);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown, startListening]);

  useEffect(() => {
    if (micStatus !== "listening") {
      return;
    }

    const nudgeTimer = window.setTimeout(() => {
      if (!isBlown) {
        setShowNudge(true);
      }
    }, 4200);

    return () => window.clearTimeout(nudgeTimer);
  }, [micStatus, isBlown]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();
    };
  }, []);

  const statusText = (() => {
    if (isBlown) {
      return "Candles out.";
    }

    if (micStatus === "blocked") {
      return "Allow the microphone, then show these candles who is boss.";
    }

    if (countdown > 0) {
      return "Get ready to blow.";
    }

    if (micStatus === "asking") {
      return "Waiting for microphone permission...";
    }

    return "Blow into the microphone.";
  })();

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#030406] px-5 py-8 text-white">
      <style>
        {`
          .bday-candle-scene,
          .bday-candle-scene * {
            box-sizing: border-box;
          }

          .bday-candle-scene {
            position: relative;
            width: min(420px, 82vw);
            height: 380px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            isolation: isolate;
          }

          .bday-room-light {
            position: absolute;
            left: 50%;
            bottom: 76px;
            width: 460px;
            height: 460px;
            transform: translateX(-50%);
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 168, 58, 0.3) 0%, rgba(186, 89, 16, 0.12) 35%, rgba(3, 4, 6, 0) 68%);
            filter: blur(10px);
            animation: bdayLightPulse 2.4s ease-in-out infinite;
            z-index: -2;
          }

          .bday-table-shadow {
            position: absolute;
            left: 50%;
            bottom: 10px;
            width: 460px;
            height: 58px;
            transform: translateX(-50%);
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.78);
            filter: blur(18px);
            z-index: -1;
          }

          .bday-cake {
            position: absolute;
            left: 50%;
            bottom: 18px;
            width: min(460px, 88vw);
            height: 132px;
            transform: translateX(-50%);
            border-radius: 48% 48% 24px 24px / 34px 34px 24px 24px;
            background:
              radial-gradient(ellipse at 50% 8%, rgba(255, 204, 139, 0.82), rgba(129, 56, 20, 0.82) 46%, rgba(38, 12, 7, 0.95) 75%),
              linear-gradient(180deg, #9d491d 0%, #4c170c 52%, #160604 100%);
            box-shadow:
              0 20px 56px rgba(0, 0, 0, 0.82),
              inset 0 18px 30px rgba(255, 175, 83, 0.2),
              inset 0 -30px 42px rgba(0, 0, 0, 0.55);
          }

          .bday-cake:before {
            content: "";
            position: absolute;
            left: 0;
            top: -30px;
            width: 100%;
            height: 68px;
            border-radius: 50%;
            background: radial-gradient(ellipse at 50% 35%, #efaa4c 0%, #8c3e08 48%, #241006 82%);
            border: 1px solid rgba(255, 172, 68, 0.45);
            box-shadow: inset 0 -14px 30px rgba(22, 7, 2, 0.66);
          }

          .bday-cake:after {
            content: "";
            position: absolute;
            left: 58px;
            right: 58px;
            top: 54px;
            height: 10px;
            border-radius: 999px;
            background: rgba(255, 186, 89, 0.26);
            box-shadow: 0 27px 0 rgba(21, 5, 3, 0.5);
          }

          .bday-holder {
            position: absolute;
            left: 50%;
            bottom: 130px;
            width: 150px;
            height: 300px;
            transform: translateX(-50%) scale(0.52);
            transform-origin: 50% 100%;
            z-index: 2;
          }

          .bday-holder *,
          .bday-holder *:before,
          .bday-holder *:after {
            position: absolute;
            content: "";
          }

          .bday-candle {
            bottom: 0;
            width: 150px;
            height: 245px;
            border-radius: 150px / 38px;
            background: linear-gradient(#e48825, #e78e0e, #833c03, #4c1a03 52%, #1c0900);
            box-shadow:
              inset 20px -30px 50px rgba(0, 0, 0, 0.42),
              inset -20px 0 50px rgba(0, 0, 0, 0.42),
              0 20px 50px rgba(0, 0, 0, 0.72);
          }

          .bday-candle:before {
            left: 0;
            top: 0;
            width: 100%;
            height: 40px;
            border-radius: 50%;
            border: 2px solid #d47401;
            background: radial-gradient(#eaa121, #8e4901 45%, #b86409 80%);
          }

          .bday-candle:after {
            width: 34px;
            height: 10px;
            left: 50%;
            top: 14px;
            transform: translateX(-50%);
            border-radius: 50%;
            background: radial-gradient(rgba(0, 0, 0, 0.62), transparent 45%);
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
          }

          .bday-thread {
            width: 6px;
            height: 36px;
            top: -17px;
            left: 50%;
            z-index: 3;
            border-radius: 40% 40% 0 0;
            transform: translateX(-50%);
            background: linear-gradient(#d6994a, #4b232c, #121212, black, #e8bb31 90%);
          }

          .bday-flame {
            width: 24px;
            height: 120px;
            left: 50%;
            bottom: 100%;
            z-index: 4;
            transform-origin: 50% 100%;
            transform: translateX(-50%);
            border-radius: 50% 50% 20% 20%;
            background: linear-gradient(white 80%, transparent);
            animation: bdayMoveFlame 6s linear infinite, bdayEnlargeFlame 5s linear infinite;
          }

          .bday-flame:before {
            width: 100%;
            height: 100%;
            border-radius: 50% 50% 20% 20%;
            box-shadow: 0 0 15px rgba(247, 93, 0, 0.42), 0 -6px 4px rgba(247, 128, 0, 0.72);
          }

          .bday-glow {
            width: 26px;
            height: 60px;
            left: 50%;
            top: -48px;
            z-index: 2;
            transform: translateX(-50%);
            border-radius: 50% 50% 35% 35%;
            background: rgba(0, 133, 255, 0.58);
            box-shadow:
              0 -40px 30px #dc8a0c,
              0 40px 50px #dc8a0c,
              inset 3px 0 2px rgba(0, 133, 255, 0.55),
              inset -3px 0 2px rgba(0, 133, 255, 0.55);
          }

          .bday-glow:before {
            width: 70%;
            height: 60%;
            left: 50%;
            bottom: 0;
            transform: translateX(-50%);
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.36);
          }

          .bday-blinking-glow {
            width: 130px;
            height: 210px;
            left: 50%;
            top: -66%;
            z-index: 1;
            transform: translateX(-50%);
            border-radius: 50%;
            background: #ff6000;
            filter: blur(68px);
            animation: bdayBlinkIt 0.12s infinite;
          }

          .bday-candle-scene.blown .bday-flame,
          .bday-candle-scene.blown .bday-glow,
          .bday-candle-scene.blown .bday-blinking-glow,
          .bday-candle-scene.blown .bday-room-light {
            opacity: 0;
            animation: none;
          }

          @keyframes bdayMoveFlame {
            0%, 100% { transform: translateX(-50%) rotate(-2deg); }
            50% { transform: translateX(-50%) rotate(2deg); }
          }

          @keyframes bdayEnlargeFlame {
            0%, 100% { height: 120px; }
            50% { height: 140px; }
          }

          @keyframes bdayBlinkIt {
            50% { opacity: 0.78; }
          }

          @keyframes bdayLightPulse {
            0%, 100% { opacity: 0.58; transform: translateX(-50%) scale(0.98); }
            50% { opacity: 0.92; transform: translateX(-50%) scale(1.05); }
          }

          .bday-candle-scene {
            width: min(560px, 90vw);
          }

          .bday-cake {
            bottom: 24px;
            width: min(500px, 88vw);
            height: 150px;
            border-radius: 34px 34px 42px 42px;
            background:
              linear-gradient(180deg, rgba(255, 236, 245, 0.34), transparent 24%),
              linear-gradient(180deg, #f7b8ce 0%, #c85f8a 48%, #5e163c 100%);
            border: 1px solid rgba(255, 209, 229, 0.42);
            overflow: visible;
            box-shadow:
              0 20px 56px rgba(0, 0, 0, 0.82),
              inset 0 18px 30px rgba(255, 235, 244, 0.22),
              inset 0 -34px 46px rgba(45, 6, 26, 0.58);
          }

          .bday-cake:before {
            left: 50%;
            top: -42px;
            width: 100%;
            height: 86px;
            transform: translateX(-50%);
            border-radius: 50%;
            background:
              radial-gradient(ellipse at 46% 35%, rgba(255, 250, 245, 0.96), rgba(255, 206, 226, 0.88) 38%, rgba(177, 65, 121, 0.88) 78%),
              #ffc8dc;
            border: 1px solid rgba(255, 236, 246, 0.72);
            box-shadow:
              0 0 46px rgba(255, 122, 177, 0.22),
              inset 0 -18px 30px rgba(92, 18, 55, 0.5);
          }

          .bday-cake:after {
            left: 44px;
            right: 44px;
            top: 52px;
            height: 9px;
            background: rgba(255, 230, 241, 0.72);
            box-shadow:
              0 34px 0 rgba(91, 18, 57, 0.62),
              0 0 18px rgba(255, 201, 225, 0.22);
          }

          .bday-frosting {
            position: absolute;
            left: 50%;
            top: -44px;
            width: min(500px, 88vw);
            height: 78px;
            transform: translateX(-50%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
          }

          .bday-drip {
            position: absolute;
            top: 28px;
            width: 28px;
            border-radius: 0 0 999px 999px;
            background: linear-gradient(#ffe8f2, #c7548a);
            box-shadow: inset 0 -8px 14px rgba(92, 18, 55, 0.42);
          }

          .bday-drip.one { left: 88px; height: 54px; }
          .bday-drip.two { left: 198px; height: 34px; width: 22px; }
          .bday-drip.three { right: 112px; height: 62px; width: 32px; }
          .bday-drip.four { right: 54px; height: 38px; width: 24px; }

          .bday-sprinkle {
            position: absolute;
            top: var(--top);
            left: var(--left);
            width: 24px;
            height: 4px;
            border-radius: 999px;
            background: var(--color);
            transform: rotate(var(--rotate));
            opacity: 0.88;
            box-shadow: 0 0 8px rgba(255,255,255,0.16);
            z-index: 2;
          }

          .bday-cake-highlight {
            position: absolute;
            left: 44px;
            right: 44px;
            top: 18px;
            height: 24px;
            border-radius: 50%;
            background: radial-gradient(ellipse, rgba(255, 245, 250, 0.42), transparent 68%);
            pointer-events: none;
            z-index: 1;
          }

          .bday-cake-base {
            position: absolute;
            left: 50%;
            bottom: -10px;
            width: 82%;
            height: 24px;
            transform: translateX(-50%);
            border-radius: 50%;
            background: rgba(32, 5, 20, 0.62);
            filter: blur(2px);
            pointer-events: none;
          }

          .bday-candles {
            position: absolute;
            inset: 0;
            z-index: 3;
          }

          .bday-birthday-candle {
            position: absolute;
            left: var(--left);
            bottom: 166px;
            width: 18px;
            height: var(--height);
            transform: translateX(-50%);
            border-radius: 7px 7px 3px 3px;
            background:
              repeating-linear-gradient(135deg, #fff4c8 0 8px, #d84f42 8px 15px);
            box-shadow:
              inset -4px 0 8px rgba(62, 14, 8, 0.32),
              inset 3px 0 5px rgba(255, 255, 255, 0.36),
              0 0 18px rgba(255, 155, 47, 0.14);
            animation: bdayCandleFloat 1.8s ease-in-out infinite;
            animation-delay: var(--delay);
          }

          .bday-birthday-candle:before {
            width: 100%;
            height: 8px;
            left: 0;
            top: -4px;
            border-radius: 50%;
            background: radial-gradient(#fff8cc, #d46a33 70%);
          }

          .bday-birthday-candle:after {
            width: 2px;
            height: 14px;
            left: 50%;
            top: -16px;
            transform: translateX(-50%);
            border-radius: 999px;
            background: linear-gradient(#d59a45, #111);
          }

          .bday-mini-glow {
            position: absolute;
            left: 50%;
            top: -46px;
            width: 46px;
            height: 70px;
            transform: translateX(-50%);
            border-radius: 50%;
            background: #ff6800;
            filter: blur(18px);
            opacity: 0.5;
            animation: bdayBlinkIt 0.14s infinite;
          }

          .bday-mini-flame {
            position: absolute;
            left: 50%;
            top: -56px;
            width: 13px;
            height: 44px;
            transform: translateX(-50%);
            transform-origin: 50% 100%;
            border-radius: 50% 50% 22% 22%;
            background: linear-gradient(white 62%, #ffd15c 78%, transparent);
            box-shadow:
              0 0 13px rgba(255, 151, 30, 0.86),
              0 -4px 8px rgba(255, 116, 0, 0.5);
            animation: bdaySmallFlame 1.1s ease-in-out infinite;
            animation-delay: var(--delay);
          }

          .bday-candle-scene.blown .bday-mini-flame,
          .bday-candle-scene.blown .bday-mini-glow {
            opacity: 0;
            animation: none;
          }

          @keyframes bdaySmallFlame {
            0%, 100% { height: 40px; transform: translateX(-50%) rotate(-3deg); }
            50% { height: 50px; transform: translateX(-50%) rotate(4deg); }
          }

          @keyframes bdayCandleFloat {
            0%, 100% { translate: 0 0; }
            50% { translate: 0 -1px; }
          }

          .bday-svg-cake-scene {
            position: relative;
            width: min(430px, 86vw);
            height: 390px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            isolation: isolate;
          }

          .bday-svg-cake-scene:before {
            content: "";
            position: absolute;
            left: 50%;
            bottom: 72px;
            width: 440px;
            height: 420px;
            transform: translateX(-50%);
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 191, 107, 0.28), rgba(255, 116, 47, 0.1) 38%, transparent 70%);
            filter: blur(12px);
            animation: bdayLightPulse 2.4s ease-in-out infinite;
            z-index: -2;
          }

          .bday-svg-cake-scene:after {
            content: "";
            position: absolute;
            left: 50%;
            bottom: 34px;
            width: 330px;
            height: 38px;
            transform: translateX(-50%);
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.72);
            filter: blur(14px);
            z-index: -1;
          }

          .bday-cake-art {
            width: min(320px, 76vw);
            height: 320px;
            overflow: visible;
            filter: drop-shadow(0 28px 36px rgba(0, 0, 0, 0.62));
          }

          .bday-cake-art .cake-cream {
            fill: #fff3df;
          }

          .bday-cake-art .cake-sponge {
            fill: #c99a84;
          }

          .bday-cake-art .cake-filling {
            fill: #8d5d68;
          }

          .bday-cake-art .cake-plate {
            fill: rgba(255, 244, 223, 0.9);
          }

          .bday-svg-candle {
            position: absolute;
            left: var(--left);
            top: 232px;
            width: 12px;
            height: var(--height);
            transform: translateX(-50%);
            border-radius: 8px;
            background: #fff8ed;
            box-shadow:
              inset -3px 0 5px rgba(142, 77, 64, 0.28),
              0 0 18px rgba(255, 192, 91, 0.3);
            animation: bdayCandleIn 600ms ease-out both, bdayCandleFloat 1.8s ease-in-out infinite;
            animation-delay: var(--delay), var(--delay);
          }

          .bday-svg-candle:before,
          .bday-svg-candle:after {
            content: "";
            position: absolute;
            left: 0;
            width: 100%;
            height: 4px;
            background: rgba(216, 72, 74, 0.62);
          }

          .bday-svg-candle:before { top: 20px; }
          .bday-svg-candle:after { top: 36px; }

          .bday-svg-wick {
            position: absolute;
            left: 50%;
            top: -12px;
            width: 2px;
            height: 14px;
            transform: translateX(-50%);
            border-radius: 999px;
            background: linear-gradient(#c48b45, #111);
          }

          .bday-svg-fire {
            position: absolute;
            left: 50%;
            top: -42px;
            width: 16px;
            height: 34px;
            margin-left: -8px;
            border-radius: 100%;
          }

          .bday-svg-fire.one { animation: bdayFuego 2s infinite; }
          .bday-svg-fire.two { animation: bdayFuego 1.5s infinite; }
          .bday-svg-fire.three { animation: bdayFuego 1s infinite; }
          .bday-svg-fire.four { animation: bdayFuego 0.55s infinite; }
          .bday-svg-fire.five { animation: bdayFuego 0.25s infinite; }

          .bday-svg-cake-scene.blown .bday-svg-fire {
            opacity: 0;
            animation: none;
          }

          @keyframes bdayFuego {
            0%, 100% {
              background: rgba(255, 249, 151, 0.78);
              box-shadow:
                0 0 28px 9px rgba(255, 176, 63, 0.36),
                0 0 60px 22px rgba(248, 233, 209, 0.1);
              transform: translateY(0) scale(1);
            }
            50% {
              background: rgba(255, 72, 0, 0.18);
              box-shadow:
                0 0 36px 18px rgba(255, 166, 54, 0.22),
                0 0 68px 32px rgba(248, 233, 209, 0.12);
              transform: translateY(-14px) scale(0.42);
            }
          }

          @keyframes bdayCandleIn {
            from { opacity: 0; transform: translateX(-50%) translateY(-28px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}
      </style>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,rgba(255,158,54,0.22),rgba(3,4,6,0.58)_25%,rgba(3,4,6,0.96)_58%)]" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[radial-gradient(ellipse_at_bottom,rgba(91,55,20,0.28),transparent_68%)]" />

      <motion.div
        className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="mb-10 min-h-24">
          {countdown > 0 && !isBlown ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <h1
                  style={{
                    fontSize: "1.5rem",
                    color: "white",
                    fontStyle: "italic",
                  }}
                  className="text-4xl font-black text-amber-50 drop-shadow-[0_0_18px_rgba(255,185,87,0.55)] md:text-6xl"
                >
                  Blow the candles
                </h1>
              </motion.div>
              <motion.p
                key={countdown}
                className="text-7xl font-black text-amber-100 drop-shadow-[0_0_24px_rgba(255,193,95,0.8)] md:text-8xl"
                initial={{ scale: 0.72, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.35 }}
                style={{ fontSize: "1rem", color: "white" }}
              >
                {countdown}
              </motion.p>
            </>
          ) : showNudge && !isBlown ? (
            <div className="min-h-24" />
          ) : (
            <></>
          )}
        </div>

        <div className="relative mb-8 flex h-96 w-full max-w-2xl items-center justify-center">
          <div
            className={`bday-svg-cake-scene ${isBlown ? "blown" : ""}`}
            role="img"
            aria-label="A layered birthday cake with one lit candle"
          >
            {svgCandles.map((candle) => (
              <div
                key={candle.left}
                className="bday-svg-candle"
                style={
                  {
                    "--left": `${candle.left}%`,
                    "--height": `${candle.height}px`,
                    "--delay": `${candle.delay}s`,
                  } as React.CSSProperties
                }
              >
                <span className="bday-svg-wick" />
                <span className="bday-svg-fire one" />
                <span className="bday-svg-fire two" />
                <span className="bday-svg-fire three" />
                <span className="bday-svg-fire four" />
                <span className="bday-svg-fire five" />
              </div>
            ))}
            <svg
              className="bday-cake-art"
              viewBox="0 250 200 240"
              aria-hidden="true"
            >
              <path
                className="cake-sponge"
                d="M173.667,427.569c-49.795,0-101.101,0-147.334,0c-3.999,0-4-16.002,0-16.002c46.385,0,97.539,0,147.334,0C177.668,411.567,177.667,427.569,173.667,427.569z"
              />
              <path
                className="cake-filling"
                d="M102.242,427.569c5.348,0,14.079,0,17.462,0c0,0,17.026,0,27.504,0c19.143,0,20.39-3.797,26.459,0c3,1.877,0,7.823,0,7.823c-2.412,2.258-58.328,0-73.667,0l0,0c-1.858,0-67.187,0-73.667,0c0,0-4.125-4.983,0-7.823c5.201-3.58,16.085,0,23.725,0c8.841,0,20.762,0,20.762,0c3.686,0,8.597,0,19.511,0H102.242z"
              />
              <path
                className="cake-sponge"
                d="M173.667,451.394c-49.298,0-102.782,0-147.334,0c-3.999,0-4-16.002,0-16.002c44.697,0,96.586,0,147.334,0C177.667,435.392,177.668,451.394,173.667,451.394z"
              />
              <path
                className="cake-filling"
                d="M173.667,451.394c2.875,0,2.997,9.257,0,9.131c-22.662-0.956-32.09-0.956-41.756-0.956c-14.48,0-17.884,0-30.163,0c-2.087,0-2.068,0-3.915,0c-13.333,0-8.963,0-23.088,0c-11.668,0-34.99-0.294-48.412,1.831c-4.109,0.65-3.01-10.006,0-10.006C37.129,451.394,149.379,451.394,173.667,451.394z"
              />
              <path
                className="cake-sponge"
                d="M173.667,475.571c-46.512,0-105.486,0-147.334,0c-3.999,0-4-16.002,0-16.002c43.566,0,97.96,0,147.334,0C177.667,459.569,177.666,475.571,173.667,475.571z"
              />
              <path
                className="cake-cream"
                d="M111.547,415.233c-6.667-0.834-9.667,4.667-13.833,3.333c-19.649-6.291-8.158,22.176-14.5,22.334c-6.667,0.166,2.833-18-13.333-22.167c-29.544-7.615-9.667,43.833-20.167,43.833c-10.333,0,8.004-55.006-16.833-39c-7.5,4.833-9.508-3.78-9.299-7.004c0.799-12.329,23.592-7.153,38.132-7.329c10.234-0.124,20.238-1.505,38.287-2.167c16.642-0.61,32.903,1.125,46.213,1.5c12.438,0.351,35.058-5.579,31.863,6.451c-5.532,20.833,1.25,28.216-4.409,27.883c-7.606-0.447-6.058-37.895-20.62-23.333c-10.167,10.166-15.972-0.747-25,12C119.547,443.568,121.798,416.515,111.547,415.233z"
              />
              <rect
                className="cake-plate"
                x="10"
                y="475.571"
                width="180"
                height="4"
                rx="2"
              />
            </svg>
          </div>
        </div>

        <p className="min-h-7 text-lg font-semibold text-amber-50/90">
          {statusText}
        </p>

        {showNudge && !isBlown && (
          <motion.div
            className="mt-5 space-y-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p
              style={{ fontSize: "1rem", color: "white" }}
              className="text-2xl font-black text-amber-100"
            >
              Eruma blow the candle...
            </p>
            <p
              style={{ fontSize: "0.8rem", color: "white" }}
              className="text-sm uppercase tracking-[0.24em] text-amber-200/60"
            >
              At this rate the candle will turn 24, before you blow it out!
            </p>
          </motion.div>
        )}

        {micStatus === "blocked" && (
          <button
            onClick={startListening}
            className="mt-7 rounded-md border border-amber-200/30 bg-amber-200/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-200/20"
          >
            Enable microphone
          </button>
        )}
      </motion.div>
    </section>
  );
}
