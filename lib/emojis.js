import emoji from 'node-emoji'
import emojis from 'node-emoji/lib/emoji.json'
import genres from './genres'

let availableEmojis = Object.keys(genres)
let allEmojis = Object.values(emojis)
let filterEmojis = []

// remove empty items marked as false
// remove duplicates
filterEmojis = availableEmojis.filter((emo, pos) => {
  if (!emo) {
    return false
  }

  return availableEmojis.indexOf(emo) == pos

})

// build array of arrays ['the_horns', '🤘']
filterEmojis = filterEmojis.map(buildEmojiArray)
allEmojis = allEmojis.map(buildEmojiArray)

function buildEmojiArray(emo) {
  return [emoji.which(emo), emo]
}

// return public methods
module.exports = {
  allEmojis: () => allEmojis,
  availableEmojis: () => filterEmojis
}
