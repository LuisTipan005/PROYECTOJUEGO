export default class StorageManager {
  static saveHighScore(score) {
    const prev = Number(localStorage.getItem('highscore') || 0);
    if (score > prev) localStorage.setItem('highscore', score);
  }
  static getHighScore() {
    return Number(localStorage.getItem('highscore') || 0);
  }
}
