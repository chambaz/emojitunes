import 'babel-polyfill'

// ==========================================================================
// Components
// ==========================================================================
import Parallaxease from 'parallaxease'
import Headroom from 'headroom.js'

import EmojiGrid from '../components/Emoji-grid'
import Masthead from '../components/Masthead'

new EmojiGrid({
  step1: '[data-step="1"]',
  step2: '[data-step="2"]',
  grid: '[data-emoji-grid]',
  reccos: '[data-reccos]',
  search: '[data-search]',
  restart: '[data-restart]'
})

$(function() {

  // init masthead
  new Masthead({
    emoji: '[data-masthead-emoji]',
    reccos: '[data-masthead-reccos]'
  })

  // init headroom
  const headroom  = new Headroom(
    document.querySelector('[data-headroom]'),
    {
      classes: {
        pinned: 'Header--pinned',
        unpinned: 'Header--unpinned',
        top: 'Header--top'
      }
    }
  )
  headroom.init()

  // init parallaxease
  new Parallaxease({
    breakpoint: '768px'
  })
})
