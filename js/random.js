// Helper functions that geneate randomness
import { ALPHABET } from "./config.js";

export function getRandomHighlightColor() {
  const channel = () =>
    Math.floor(200 + Math.random() * 56)
      .toString(16)
      .padStart(2, "0");
  return `#${channel()}${channel()}${channel()}`;
}

export function randomLetter() {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

export function randomWord(source) {
  return source[Math.floor(Math.random() * source.length)];
}
