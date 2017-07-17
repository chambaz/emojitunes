import request from 'superagent'
import emoji from 'node-emoji'
import genres from '../../lib/genres'

export default class Search {
  constructor(opts) {
    this.step1 = document.querySelector(opts.step1)
    this.step2 = document.querySelector(opts.step2)
    this.grid = document.querySelector(opts.grid)
    this.reccos = document.querySelector(opts.reccos)
    this.restart = document.querySelector(opts.restart)
    this.title = document.querySelector(opts.title)
    this.list = document.createElement('ul')

    // fill this.list with li nodes
    Object.keys(genres).map((emo, i) => this.addEmojiNode(emo, i))

    // add class to ul and append to DOM
    this.list.classList.add('Emoji-grid__list')
    this.grid.appendChild(this.list)

    // restart after choosing emoji
    this.restart.addEventListener('click', e => this.reset(e))
  }

  // append li nodes to this.list
  addEmojiNode(emo, i) {
    const emojiDetails = genres[emo]
    const child = document.createElement('li')
    child.classList.add('Emoji-grid__item')
    child.setAttribute('data-emoji', `${emojiDetails.genre} ${emojiDetails.keyword} ${emoji.which(emo)} ${emo}`)
    child.setAttribute('data-index', i)
    child.setAttribute('data-visible', 'true')
    child.innerHTML = emo
    child.tabIndex = 0
    child.addEventListener('click', e => this.getRecommendations(e.currentTarget.innerHTML))

    this.list.appendChild(child)
  }

  // fade out content and fetch recommendations from API
  getRecommendations(emo) {
    this.title.innerHTML = ''
    this.reccos.innerHTML = ''
    this.step1.style.opacity = 0
    setTimeout(() => {
      this.step1.style.display = 'none'
      this.step1.style.zIndex = -1
      this.step2.style.display = 'block'
      this.step2.style.zIndex = 0
      this.step2.style.opacity = 1
    }, 350)

    request
      .get(`/api/recommendations/tracks/${emo}`)
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

        console.log(json)

        this.showRecommendations(emo, json.items.slice(0, 3))
      })
  }

  // append recommendation iframes to DOM
  showRecommendations(emo, tracks) {
    this.title.innerHTML = `The sweet sounds of ${emo}`
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
  reset(e) {
    e.preventDefault()
    this.step2.style.opacity = 0

    setTimeout(() => {
      this.step2.style.display = 'none'
      this.step2.style.zIndex = -1
      this.step1.style.display = 'block'

      setTimeout(() => {
        this.step1.style.opacity = 1
      }, 50)
    }, 350)
  }
}
