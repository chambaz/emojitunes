// object of emojis / keywords
const emojis = require('../../lib/emojis')

export default class Masthead {
  constructor(opts) {
    this.randomEmoji = this.randomEmoji(emojis.availableEmojis())
    this.ui = {
      emoji: document.querySelector(opts.emoji),
      reccos: document.querySelector(opts.reccos)
    }

    this.ui.emoji.innerHTML = this.randomEmoji[1]
    this.getRecommendations(this.randomEmoji[1])
  }

  getRecommendations(emoji) {
    let markup = ''
    $.get(`/api/recommendations/tracks/${emoji}`, data => {
      markup = data.items.slice(0, 2).map(item => {
        return `
          <li class="Masthead-recommendations__item">
            <div
              class="Masthead-recommendations__embed"
              data-parallax='{"y": -60}'>
              <iframe src="https://embed.spotify.com/?uri=${item.embed}"
      						width="315"
      						height="390
      						frameborder="0"
      						style="border: 0;"
      						allowtransparency="true">
      				</iframe>
            </div>
          </li>
        `
      })

      this.ui.reccos.innerHTML = markup.join('')
    })
  }

  randomEmoji(emojis) {
    return emojis[Math.floor(Math.random() * (emojis.length -1))]
  }
}
