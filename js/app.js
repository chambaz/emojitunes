import 'babel-polyfill'

// ==========================================================================
// Components
// ==========================================================================
// import EmojiGrid from '../components/Emoji-grid'
import Parallaxease from 'parallaxease'
import Headroom from 'headroom.js'

// new EmojiGrid({
//   step1: '[data-step="1"]',
//   step2: '[data-step="2"]',
//   grid: '[data-emoji-grid]',
//   reccos: '[data-reccos]',
//   search: '[data-search]',
//   restart: '[data-restart]'
// })

$(function() {

  // init headroom
  const headroom  = new Headroom(
    document.querySelector('[data-headroom]'),
    {
      classes: {
        pinned: 'Header--pinned',
        unpinned: 'Header--unpinned'
      }
    }
  )
  headroom.init()

  // init parallaxease
  new Parallaxease({
    breakpoint: '768px'
  })
})
