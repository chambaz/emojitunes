// object of emojis / keywords
const emojis = require('../../lib/emojis')
const raf = require('raf')

export default class Masthead {
  constructor(opts) {
    // emoji and recommendation containers
    this.ui = {
      steps: $(opts.steps),
      emoji: $(opts.emoji),
      reccos: $(opts.reccos)
    }

    this.pause = false

    // kick off animation
    raf(() => {
      setTimeout(() => this.intro(), 1000)
    })

    document.addEventListener('visibilitychange', this.handleVisibility.bind(this), false)
  }

  intro() {
    this.ui.steps.each(function(i) {
      setTimeout(() => {
        raf(() => {
          $(this).animate({
            opacity: 1
          }, 350)
        })
      }, i * 200)
    })

    // kick off animation
    this.restartAnimation()
  }

  animateOpts() {
    const animateOpts = {
      large: {
        in: {
          left: 0,
          opacity: 1
        },
        out: {
          left: '50vw',
          opacity: 1
        }
      },
      small: {
        in: {
          opacity: 1,
          left: 0
        },
        out: {
          opacity: 0,
          left: 0
        }
      }
    }

    const matchMedia = window.matchMedia('(min-width: 64.375em)').matches
    console.log(matchMedia ? animateOpts.large : animateOpts.small)

    return matchMedia ? animateOpts.large : animateOpts.small
  }

  // handle animating in and out
  animate() {
    let animateOpts = this.animateOpts()
    raf(() => {
      this.animateIn(animateOpts)
    })

    setTimeout(() => {
      animateOpts = this.animateOpts()
      raf(() => {
        this.animateOut(animateOpts)
      })

      setTimeout(() => this.restartAnimation(), 1000)
    }, 5000)
  }

  // fade in emoji and slide in reccomendations
  animateIn(animateOpts) {
    // fade in emoji
    this.ui.emoji.animate({
      opacity: 1
    }, 350, () => {
      // loop through recommendations and slide each in
      setTimeout(() => {
        this.ui.reccos.find('[data-masthead-recco]').each(function(i) {
          setTimeout(() => {
            $(this).animate(animateOpts.in, 500, 'easeOutQuad')
          }, i * 200)
        })
      }, 300)
    })
  }

  // fade out emoji and slide out recommendations
  animateOut(animateOpts) {
    // fade out emoji
    this.ui.emoji.animate({
      opacity: 0
    }, 350)

    // loop through reccomendations and slide each out
    this.ui.reccos.find('[data-masthead-recco]').each(function(i) {
      setTimeout(() => {
        $(this).animate(animateOpts.out, 500, 'easeInBack')
      }, i * 200)
    })
  }

  // grab new emoji / recommendations and restart animation cycle
  restartAnimation(delay = 500) {
    this.setEmojiAndRecommendations()

    if (!this.pause) {
      setTimeout(() => this.animate(), delay)
    }
  }

  handleVisibility() {
    if (document['hidden']) {
      this.pause = true
    } else {
      this.pause = false
      this.restartAnimation()
    }
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
      						width="300"
      						height="380
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
