import emoji from 'node-emoji'
import emojis from 'node-emoji/lib/emoji.json'
import genres from './genres'

let availableEmojis = Object.keys(genres)
let allEmojis = Object.values(emojis)

// build array of arrays ['the_horns', '🤘']
availableEmojis = availableEmojis.map(buildEmojiArray)
allEmojis = allEmojis.map(buildEmojiArray)

function buildEmojiArray(emo) {
  return [emoji.which(emo), emo]
}

// return public methods
module.exports = {
  allEmojis: () => allEmojis,
  availableEmojis: () => availableEmojis
}
