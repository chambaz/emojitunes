// object of emojis / keywords
const emojis = require('../../lib/emojis')

export default class Masthead {
  constructor(opts) {
    this.ui = {
      emoji: document.querySelector(opts.emoji),
      reccos: document.querySelector(opts.reccos)
    }

    setTimeout(() => this.restartAnimation(), 1000)
  }

  animate() {
    this.animateIn()
    setTimeout(() => this.animateOut(), 5000)
  }

  animateIn() {
    $(this.ui.emoji).animate({
      opacity: 1
    }, 350, () => {
      setTimeout(() => {
        $(this.ui.reccos).find('[data-masthead-recco]').each(function(i) {
          setTimeout(() => {
            $(this).animate({
              left: 0
            }, 500, 'easeOutQuad')
          }, i * 200)
        })
      }, 500)
    })
  }

  animateOut() {
    $(this.ui.emoji).animate({
      opacity: 0
    }, 350)

    $(this.ui.reccos).find('[data-masthead-recco]').each(function(i) {
      setTimeout(() => {
        $(this).animate({
          left: '50vw'
        }, 500, 'easeInBack')
      }, i * 200)
    })

    setTimeout(() => this.restartAnimation(), 1000)
  }

  restartAnimation() {
    this.setEmojiAndRecommendations()
    setTimeout(() => this.animate(), 500)
  }

  setEmojiAndRecommendations() {
    const randomEmoji = this.randomEmoji(emojis.availableEmojis())
    this.ui.emoji.innerHTML = randomEmoji[1]
    this.getRecommendations(randomEmoji[1])
  }

  getRecommendations(emoji) {
    let markup = ''
    $.get(`/api/recommendations/tracks/${emoji}`, data => {
      markup = data.items.slice(0, 2).map(item => {
        return `
          <li
            class="Masthead-recommendations__item"
            data-masthead-recco>
            <div class="Masthead-recommendations__embed">
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
