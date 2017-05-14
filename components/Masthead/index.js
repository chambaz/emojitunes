// object of emojis / keywords
const emojis = require('../../lib/emojis')

export default class Masthead {
  constructor(opts) {
    // emoji and recommendation containers
    this.ui = {
      steps: $(opts.steps),
      emoji: $(opts.emoji),
      reccos: $(opts.reccos)
    }

    // kick off animation
    setTimeout(() => this.intro(), 1000)
  }

  intro() {
    this.ui.steps.each(function(i) {
      setTimeout(() => {
        $(this).animate({
          opacity: 1
        }, 350)
      }, i * 200)
    })

    // kick off animation
    this.restartAnimation()
  }

  // handle animating in and out
  animate() {
    this.animateIn()
    setTimeout(() => {
      this.animateOut()
      setTimeout(() => this.restartAnimation(), 1000)
    }, 5000)
  }

  // fade in emoji and slide in reccomendations
  animateIn() {
    // fade in emoji
    this.ui.emoji.animate({
      opacity: 1
    }, 350, () => {
      // loop through recommendations and slide each in
      setTimeout(() => {
        this.ui.reccos.find('[data-masthead-recco]').each(function(i) {
          setTimeout(() => {
            $(this).animate({
              left: 0
            }, 500, 'easeOutQuad')
          }, i * 200)
        })
      }, 300)
    })
  }

  // fade out emoji and slide out recommendations
  animateOut() {
    // fade out emoji
    this.ui.emoji.animate({
      opacity: 0
    }, 350)

    // loop through reccomendations and slide each out
    this.ui.reccos.find('[data-masthead-recco]').each(function(i) {
      setTimeout(() => {
        $(this).animate({
          left: '50vw'
        }, 500, 'easeInBack')
      }, i * 200)
    })
  }

  // grab new emoji / recommendations and restart animation cycle
  restartAnimation(delay = 500) {
    this.setEmojiAndRecommendations()
    setTimeout(() => this.animate(), delay)
  }

  // grab new emoji and reccomendations
  setEmojiAndRecommendations() {
    const randomEmoji = this.randomEmoji(emojis.availableEmojis())
    this.ui.emoji.html(randomEmoji[1])
    this.getRecommendations(randomEmoji[1])
  }

  // pick random emoji
  randomEmoji(emojis) {
    return emojis[Math.floor(Math.random() * (emojis.length -1))]
  }

  // get recommendations from API, build markup, add to DOM
  getRecommendations(emoji) {
    let markup = ''
    $.get(`/api/recommendations/tracks/${emoji}`, data => {
      // build markup template string with first two recommendations returned
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

      // add markup string to DOM
      this.ui.reccos.html(markup.join(''))
    })
  }
}
