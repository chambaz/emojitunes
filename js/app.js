import 'babel-polyfill'

// ==========================================================================
// Components
// ==========================================================================
import EmojiGrid from '../components/Emoji-grid'
import Slack from '../components/Slack'

new EmojiGrid({
  step1: '[data-step="1"]',
  step2: '[data-step="2"]',
  grid: '[data-emoji-grid]',
  reccos: '[data-reccos]',
  search: '[data-search]',
  restart: '[data-restart]'
})

// new Slack({
//   msgs: '[data-slack-msg]',
//   randomMsgs: '[data-msg="random"]'
// })
