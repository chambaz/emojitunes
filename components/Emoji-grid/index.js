import request from 'superagent'
import emoji from 'node-emoji'
import genres from '../../lib/genres'

export default class Search {
  constructor(opts) {
    // this.step1 = document.querySelector(opts.step1)
    // this.step2 = document.querySelector(opts.step2)
    this.grid = document.querySelector(opts.grid)
    // this.reccos = document.querySelector(opts.reccos)
    this.search = document.querySelector(opts.search)
    // this.restart = document.querySelector(opts.restart)
    this.list = document.createElement('ul')

    // fill this.list with li nodes
    Object.keys(genres).map((emo, i) => this.addEmojiNode(emo, i))

    // add class to ul and append to DOM
    this.list.classList.add('Emoji-grid__list')
    this.grid.appendChild(this.list)

    // restart after choosing emoji
    // this.restart.addEventListener('click', () => this.reset())

    // text input filter emojis
    this.search.addEventListener('keyup', e => this.filterEmojis(e))

    // keyboard nav
    document.addEventListener('keydown', e => this.keyboardNav(e))
  }

  // append li nodes to this.list
  addEmojiNode(emo, i) {
    const emojiDetails = genres[emo]
    const child = document.createElement('li')
    child.classList.add('Emoji-grid__item')
    child.setAttribute('data-emoji', `${emojiDetails.genre} ${emojiDetails.keyword} ${emoji.which(emo)}`)
    child.setAttribute('data-index', i)
    child.setAttribute('data-visible', 'true')
    child.innerHTML = emo
    child.tabIndex = 0
    child.addEventListener('click', e => this.getRecommendations(e.currentTarget.innerHTML))

    this.list.appendChild(child)
  }

  // filter this.list based on search form value
  filterEmojis(e) {
    this.list.querySelectorAll('[data-emoji]').forEach(item => {
      if (!item.getAttribute('data-emoji').includes(e.currentTarget.value)) {
        item.classList.add('Emoji-grid__item--hide')
        item.setAttribute('data-visible', 'false')
      } else {
        item.classList.remove('Emoji-grid__item--hide')
        item.setAttribute('data-visible', 'true')
      }
    })
  }

  // fade out content and fetch recommendations from API
  getRecommendations(emo) {
    console.log(emo)
    this.reccos.innerHTML = '<p class="Recommendations__loading">Fetching tunes...</p>'
    this.step1.style.opacity = 0
    setTimeout(() => {
      this.step1.style.display = 'none'
      this.step2.style.display = 'block'
      this.step2.style.opacity = 1
    }, 350)

    request
      .get(`/api/recommendations/${emo}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) {
          this.step1.style.opacity = 1
          console.log('Error getting recommendations', err)
          return
        }

        const json = JSON.parse(res.text)

        if (json.error) {
          this.step1.style.opacity = 1
          console.log(json.error)
          return
        }

        this.showRecommendations(json.tracks)
      })
  }

  // append recommendation iframes to DOM
  showRecommendations(tracks) {
    this.reccos.innerHTML = ''
    tracks.forEach(track => {
      const trackContainer = document.createElement('div')
      trackContainer.classList.add('Recommendations__item')
      const iframe = `
        <iframe src="https://embed.spotify.com/?uri=${track.url}"
            width="300"
            height="380"
            frameborder="0"
            style="border: 0;"
            allowtransparency="true">
        </iframe>
      `
      trackContainer.innerHTML = iframe
      this.reccos.appendChild(trackContainer)
    })
  }

  // reset back to emoji list
  reset() {
    this.step2.style.opacity = 0

    setTimeout(() => {
      this.step2.style.display = 'none'
      this.step1.style.display = 'block'

      setTimeout(() => {
        this.step1.style.opacity = 1
      }, 50)
    }, 350)
  }

  // keyboard navigation for search filed and emoji list
  keyboardNav(e) {
    const active = document.activeElement
    const activeIndex = active.hasAttribute('data-index') ?
                        Number(active.getAttribute('data-index')) : -1

    switch (e.keyCode) {

    // left / up
    // focus on previous visible emoji in listfocus on search
    // if focussed on first emoji then
    case 37:
    case 38:
      e.preventDefault()
      if (activeIndex === 0) {
        this.search.focus()
      } else {
        const quickPrev = this.list.querySelector(`[data-index="${activeIndex - 1}"`)
        let slowPrev = false

        if (quickPrev.getAttribute('data-visible') === 'true') {
          quickPrev.focus()
          return
        }

        Array.prototype.slice
        .call(this.grid.querySelectorAll('[data-visible="true"]'))
        .reverse()
        .every(item => {
          console.log(item, activeIndex)
          if (Number(item.getAttribute('data-index')) < activeIndex) {
            item.focus()
            slowPrev = true
            return false
          }

          return true
        })

        if (!slowPrev) {
          this.search.focus()
        }
      }

      break

    // right / down
    // focus on next visible emoji in list
    case 39:
    case 40:
      e.preventDefault()

      Array.prototype.slice
      .call(this.grid.querySelectorAll('[data-visible="true"]'))
      .every(item => {
        if (Number(item.getAttribute('data-index')) > activeIndex) {
          item.focus()
          return false
        }

        return true
      })

      break

    case 13:
      if (active.hasAttribute('data-emoji')) {
        this.getRecommendations(active.innerHTML)
      }
      break
    }
  }
}
