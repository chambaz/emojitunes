#!/usr/bin/env nodejs

// require config, http, routing modules
const config = require('./config')
const http = require('http')
const routes = require('patterns')()
const st = require('st')

// serve static files in public directory
const staticDir = st({
  path: `${__dirname}/public`,
  url: '/',
  index: 'index.html'
})

// require spotify and initialise Spotify
const SpotifyWebApi = require('spotify-web-api-node')
const spotifyApi = new SpotifyWebApi(config.spotify)

const emoji = require('node-emoji')

// lodash helper functions
const _ = {
  forOwn: require('lodash/forOwn'),
  shuffle: require('lodash/shuffle'),
  difference: require('lodash/difference')
}

// object of emojis / keywords
const genres = require('./lib/genres')
const aliases = require('./lib/aliases')

// possible response messages
const msgs = require('./lib/msgs')

// fetch spotify access token
// clientCredentials method does not require user authentication
spotifyApi.clientCredentialsGrant().then(data => {
  spotifyApi.setAccessToken(data.body.access_token)
}, error => {
  console.log('Error retrieving access token', error)
})

// get recommendations API route
// @param type e.g 'tracks' 'playlists'
// @param emoji e.g 🤘
// @return JSON object containing genre and track arrays
routes.add('GET /api/recommendations/{type}/{emoji}', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.params.type !== 'tracks' && req.params.type !== 'playlists') {
    res.end(JSON.stringify({
      error: 'Only tracks and playlists supported'
    }))
  }


  // TODO: write emoji to file with timestamp

  const decodedEmojiParam = decodeURIComponent(req.params.emoji)
  let foundEmoji = false

	// param is actual emoji e.g 🤘
  if (emoji.which(decodedEmojiParam)) {
    foundEmoji = decodedEmojiParam

	// param is txt emoji e.g :the_horns:
  } else if (emoji.which(emoji.get(decodedEmojiParam))) {
    foundEmoji = emoji.get(decodedEmojiParam)
  } else {
    res.end(JSON.stringify({
      msg: msgs.getNoEmojiMsg()
    }))
    return
  }

  getRecommendations(req.params.type, foundEmoji)
    .then(
      recommendations => res.end(JSON.stringify(recommendations)),
      error => res.end(JSON.stringify(error)))
    .catch(() => {
      console.log('Error getting reccos')
    })
})

// get recommendations-browser API route
// @param type e.g 'tracks' 'playlists'
// @param emoji e.g 🤘
// @return grid of iframe embeds
routes.add('GET /api/recommendations-browser/{type}/{emoji}', (req, res) => {
  res.setHeader('Content-Type', 'text/html')

  if (req.params.type !== 'tracks' && req.params.type !== 'playlists') {
    res.end(JSON.stringify({
      error: 'Only tracks and playlists supported'
    }))
  }

  const decodedEmojiParam = decodeURIComponent(req.params.emoji)
  let foundEmoji = false

	// param is actual emoji e.g 🤘
  if (emoji.which(decodedEmojiParam)) {
    foundEmoji = decodedEmojiParam

	// param is txt emoji e.g :the_horns:
  } else if (emoji.which(emoji.get(decodedEmojiParam))) {
    foundEmoji = emoji.get(decodedEmojiParam)
  } else {
    res.end('Emoji not supported')
  }

  getRecommendations(req.params.type, foundEmoji).then(recommendations => {
		// no tracks found
    if (!recommendations.items.length) {
      res.end('Nothing found 😞')
      return
    }

    const output = []

		// loop through recommendations and build up array of iframes
    recommendations.items.forEach(item => {
      output.push(`
				<iframe src="https://embed.spotify.com/?uri=${item.embed}"
						width="300"
						height="380
						frameborder="0"
						style="border: 0;"
						allowtransparency="true">
				</iframe>
      `)
    })

		// render flex box grid of iframes with title of comma separated genres
    res.end(`
			<div style="width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap;">
				${output.join('<br />')}
			</div>
		`)
  }, error => {
    console.log('Error fetching recommendations', error)
    res.end('No genres match emoji')
  }).catch(() => {
    console.log('Error fetching recommendations')
  })
})

// get recommendations message
// @params emoji e.g 🤘
// @return JSON object containing genre and track arrays
routes.add('GET /api/msgs/recommendation/{emoji}', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')

  res.end(JSON.stringify({
    msg: msgs.getRecommendationMsg(decodeURIComponent(req.params.emoji))
  }))
})

// get no results message
// @return JSON object containing genre and track arrays
routes.add('GET /api/msgs/no-results', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')

  res.end(JSON.stringify({
    msg: msgs.getNoResultsMsg()
  }))
})

// get no emoji message
// @return JSON object containing genre and track arrays
routes.add('GET /api/msgs/no-emoji', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')

  res.end(JSON.stringify({
    msg: msgs.getNoEmojiMsg()
  }))
})

// create server
const server = http.createServer((req, res) => {
	// match routes
  const match = routes.match(`${req.method} ${req.url}`)

	// if match found call function
  if (match) {
    const fn = match.value
    req.params = match.params
    fn(req, res)
  } else {
    staticDir(req, res)
  }
})

// listen for http request on port 9000
server.listen(8080, () => {
  console.log('🤘 Server is running 🤘')
})

function getRecommendations(type, emo) {
  let q = fetchEmojiData(emo)
  console.log(q)

  // return promise and wait for Spotify API call
  return new Promise((resolve, reject) => {
    let items = []
    let search = ''
    let method = ''

    if (type === 'playlists') {
      method = 'searchPlaylists'
    } else {
      method = 'searchTracks'
    }

    if (method === 'searchTracks' && Array.isArray(q.playlist)) {

      // fetch playlist
      spotifyApi.getPlaylist(q.playlist[0], q.playlist[1]).then(data => {

        // loop through each track and add object containing artist, title, url
        data.body.tracks.items.forEach(track => {
          items.push({
            url: track.track.external_urls.spotify,
            embed: track.track.uri
          })
        })

        // resolve promise and return shuffled genres and tracks
        items = _.shuffle(items)
        resolve({
          items
        })

      }, err => {
        resolve({
          items
        })
      })

      // pick random track
    } else {
      search = sortSearchParams(q)

      // try fetching recommendations by genre
      spotifyApi[method](search).then(data => {

        // loop through each track and add object containing artist, title, url
        data.body[type].items.forEach(track => {
          items.push({
            url: track.external_urls.spotify,
            embed: track.uri
          })
        })

        // if no items found then do keyword search instead
        if (!items.length) {
          spotifyApi[method](q.keyword).then(data => {
            // loop through each track and add object containing artist, title, url
            data.body[type].items.forEach(track => {
              items.push({
                url: track.external_urls.spotify,
                embed: track.uri
              })
            })

            // resolve promise and return shuffled genres and tracks
            items = _.shuffle(items)
            resolve({
              items
            })
          }, err => {
            resolve({
              items
            })
          })

        // otherwise return genre reccos
        } else {
          // resolve promise and return shuffled genres and tracks
          items = _.shuffle(items)
          resolve({
            items
          })
        }
      }, err => {
        resolve({
          items
        })
      })
    }
  })
}

function sortSearchParams(q) {
  let search = ''

  if (q.track || q.artist) {
    if (q.track && !q.artist) {
      search = `track:"${q.track}"`
    } else if (q.artist && !q.track) {
      search = `artist:"${q.artist}"`
    } else if (q.track && q.artist) {
      search = `track:"${q.track}" artist:"${q.artist}"`
    }
  } else {
    search = `genre:"${q.genre}"`
  }

  return search
}

// match emoji in genres list
function fetchEmojiData(emo) {
  let data = null

  // first check if emoji is an alias
  data = aliases[emo]

  // pick emoji object from list
  if (data) {
    data = genres[data]
  } else {
    data = genres[emo]
  }

  // if none found then pick random emoji
  if (!data) {
    const genreKeys = Object.keys(genres)
    return fetchEmojiData(genreKeys[Math.floor(Math.random() * genreKeys.length)])
  }

  return data
}
