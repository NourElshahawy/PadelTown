// src/data/tournaments.js

export const tournaments = globalThis.tournaments || [];

if (!globalThis.tournaments) {
  globalThis.tournaments = tournaments;
}
