/// <reference types="vite/client" />

declare module 'canvas-confetti'

interface Window {
  webkitAudioContext?: typeof AudioContext
}
