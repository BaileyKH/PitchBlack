import { start } from "node:repl"


async function getPlaylists(access_token) {
    const headers = {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + access_token
	    }
    }

    const res = await fetch('https://api.spotify.com/v1/me/playlists', headers)
    const data = await res.json()

    return data
}

async function getPlaylistItems(access_token, playlistId) {
    const headers = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    }

    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, headers)
    const data = await res.json()

    return data
}

async function startPlayback(access_token, uri) {
    const headers = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token
        },
        body: JSON.stringify({
            context_uri: uri
        })
    }

    const res = await fetch(`https://api.spotify.com/v1/me/player/play`, headers)
    const data = await res.json()

    return data
}

module.exports = {
    getPlaylists,
    getPlaylistItems,
    startPlayback
}