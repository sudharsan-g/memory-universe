/// <reference types="vite/client" />

declare module 'canvas-confetti'
declare module "*.mp3";
declare module "*.mp4";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";

interface Window {
  webkitAudioContext?: typeof AudioContext
}
