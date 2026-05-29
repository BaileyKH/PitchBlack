

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
            uris: [uri]
        })
    }

    const res = await fetch(`https://api.spotify.com/v1/me/player/play`, headers)

    if (res.status === 204) return { success: true }

    const data = await res.json()

    return data
}

async function currentlyPlaying(access_token) {
    const headers = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    }

    const res = await fetch(`https://api.spotify.com/v1/me/player/currently-playing`, headers)

    if (res.status === 204) return { success: true }

    const data = await res.json()

    return data
}

async function skipNext(access_token) {
    const headers = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    }

    const res = await fetch(`https://api.spotify.com/v1/me/player/next`, headers)

    if (res.status === 204) return { success: true }

    const data = await res.json()

    return data

}

async function skipPrevious(access_token) {
    const headers = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    }

    const res = await fetch(`https://api.spotify.com/v1/me/player/previous`, headers)

    if (res.status === 204) return { success: true }

    const data = await res.json()

    return data
}

async function pausePlayback(access_token) {
    const headers = {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    }

    const res = await fetch(`https://api.spotify.com/v1/me/player/pause`, headers)

    if (res.status === 204) return { success: true }

    const data = await res.json()

    return data
}

async function setVolume(access_token, volume) {
    const headers = {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    }

    const res = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`, headers)

    if (res.status === 204) return { success: true }

    const data = await res.json()

    return data
}

module.exports = {
    getPlaylists,
    getPlaylistItems,
    startPlayback,
    currentlyPlaying,
    skipNext,
    skipPrevious,
    pausePlayback,
    setVolume
}