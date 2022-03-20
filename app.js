require("dotenv").config()

const express = require("express")
const hbs = require("hbs")
const SpotifyWebApi = require("spotify-web-api-node")

const app = express()

app.set("view engine", "hbs")
app.set("views", __dirname + "/views")
app.use(express.static(__dirname + "/public"))

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
})

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) => console.log("Something went wrong when retrieving an access token", error))

app.get("/home", async (req, res) => {
  res.render("home")
})

app.get("/search-artist", (request, response, next) => {
  const { artist } = request.query
  spotifyApi
    .searchArtists(artist)
    .then((data) => {
      const artists = data.body.artists.items.map((el) => {
        return {
          id: el.id,
          name: el.name,
          imageURL: el.images[0] ? el.images[0].url : null,
        }
      })
      response.render("artist-search-results", { artists })
    })
    .catch((err) => console.log("The error while searching artists occurred: ", err))
})

app.get("/albums/:artistId", (req, res, next) => {
  const { artistId } = req.params
  spotifyApi.getArtistAlbums(artistId, { limit: 10, offset: 0 }).then((data) => {
    const albums = data.body.items.map((el) => {
      return {
        id: el.id,
        name: el.name,
        imageURL: el.images[0] ? el.images[0].url : null,
      }
    })
    const result = {
      albums,
      artist: data.body?.items[0]?.artists[0],
    }
    res.render("albums", result)
  })
  .catch((err) => console.log("The error while searching albums occurred: ", err))
})

app.get("/tracks/:id", (req, res, next) => {
  const { id } = req.params
  spotifyApi.getAlbumTracks(id, { limit : 20, offset : 0 }).then((data) => {
    console.log('tracks', data.body.items);
    const result = {
      tracks: data.body.items,
      artist: data.body?.items[0]?.artists[0],
    }
    res.render("tracks", result)
  })
  .catch((err) => console.log("The error while searching tracks occurred: ", err))
})

app.listen(3000, () => console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊"))
