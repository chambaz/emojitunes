# EmojiTunes

Get Spotify recommendations from emojis.

**Installation**

```
$ npm install

# start dev server
$ npm run dev

# start prod server
$ npm start
```

💻 **Dev**: [localhost:3000](http://localhost:3000/)

🌎 **Prod**: [localhost:8080](http://localhost:8080/)

**API**

```
# Return array of recommendations
/api/recommendations/🤘

{
  genres: [
    "hard-rock",
    "metal-misc",
    "metal",
    "death-metal"
  ],
  tracks: [
    {
      artist: "Pantera",
      title: "Cowboys From Hell",
      url: "https://open.spotify.com/track/2SgbR6ttzoNlCRGQOKjrop"
    },
    ...
  ]
}

# Return object of genre and emoji mapping
/api/genres

{
  'british': [
    '🇬🇧'
  ]
  ...
}

# Return array of current, available, and new genres
/api/new-genres

{
  current: [],
  available: [],
  new: []
}

# Return HTML page of iframes
/api/recommendations-browser/🤘
```
