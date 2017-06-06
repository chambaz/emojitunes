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

  getRecommendations(req.params.type, foundEmoji).then(
		recommendations => res.end(JSON.stringify(recommendations)),
		error => res.end(JSON.stringify(error))
	)
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

function getRecommendations(type, emoji) {
  let q = {}

  // loop through emojis object
  _.forOwn(genres, (emoData, emo) => {
    if (emoji === emo) {
      q = emoData
    }
  })

  // return promise and wait for Spotify API call
  return new Promise(resolve => {
    if (!q.keyword) {
      resolve({
        msg: 'Emoji not supported'
      })
    }

    console.log(q)

    let method = 'searchPlaylists'
    let search = `genre:"${q.genre}"`

    if (type === 'tracks') {
      method = 'searchTracks'
    }

		// try fetching recommendations by genre
    spotifyApi[method](search).then(data => {
      let items = []

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
        })

      // otherwise return genre reccos
      } else {
        // resolve promise and return shuffled genres and tracks
        items = _.shuffle(items)
        resolve({
          items
        })
      }
    })
  })
}
