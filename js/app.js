import 'babel-polyfill'

// ==========================================================================
// Components
// ==========================================================================
import Parallaxease from 'parallaxease'
import Headroom from 'headroom.js'
import OpenShare from 'openshare'

import EmojiGrid from '../components/Emoji-grid'
import Masthead from '../components/Masthead'

new EmojiGrid({
  step1: '[data-emoji-grid-step="1"]',
  step2: '[data-emoji-grid-step="2"]',
  grid: '[data-emoji-grid]',
  reccos: '[data-emoji-grid-reccos]',
  restart: '[data-emoji-grid-restart]',
  title: '[data-emoji-grid-title]'
})

$(function() {

  // init masthead
  new Masthead({
    steps: '[data-masthead-step]',
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
