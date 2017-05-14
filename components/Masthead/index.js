// object of emojis / keywords
const emojis = require('../../lib/emojis')

export default class Masthead {
  constructor(opts) {
    this.randomEmoji = this.randomEmoji(emojis.availableEmojis())
    this.ui = {
      emoji: document.querySelector(opts.emoji)
    }

    this.ui.emoji.innerHTML = this.randomEmoji[1]
  }

  randomEmoji(emojis) {
    return emojis[Math.floor(Math.random() * (emojis.length -1))]
  }
}
