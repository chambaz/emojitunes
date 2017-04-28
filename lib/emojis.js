import emoji from 'node-emoji'
import emojis from 'node-emoji/lib/emoji.json'
import genres from './genres'

let availableEmojis = Object.values(genres)
let allEmojis = Object.values(emojis)
let filterEmojis = []

// mark empty items with false
// else return first emoji from array
// TODO: support multiple emojis per genre
availableEmojis = availableEmojis.map((genre, emoji) => {
  if (!genre.length) {
    return false
  }

  return emoji
})

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
