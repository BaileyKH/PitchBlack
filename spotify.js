

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

module.exports = {
    getPlaylists
}