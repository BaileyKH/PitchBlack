

const vscode = require('vscode');
require('dotenv').config();
const spotify = require('./spotify');

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

async function authenticate() {
	let state = generateRandomString(16)
	const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative'
	const response_type = 'code'
	const client_id = process.env.SPOTIFY_CLIENT_ID
	const redirect_uri = 'http://127.0.0.1:8080/callback'
	const spotify_uri = 'https://accounts.spotify.com/authorize?'

	let full_uri = `${spotify_uri}response_type=${response_type}&client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}&state=${state}`

	const uri = vscode.Uri.parse(full_uri)
	const success = await vscode.env.openExternal(uri)

	if (success) {
		console.log('Opening spotify login page...')
	}
}


const http = require('node:http');

const PORT = 8080

function callbackServer() {
	return new Promise((resolve, reject) => {
        	const server = http.createServer((req, res) => {
			const parsedUrl = new URL(req.url, 'http://127.0.0.1:8080')
			let code = parsedUrl.searchParams.get('code')

			resolve(code)
			res.end('Authentication successful, please close this page')
			server.close()
			console.log('Closed Server')
		})

		server.listen(PORT, () => {
			console.log(`Server running on port; ${PORT}`)
		})
    })

}

let access_token = '';
let refresh_token = '';

async function getToken(code) {
	const body = new URLSearchParams({
	code: code,
	redirect_uri: 'http://127.0.0.1:8080/callback',
	grant_type: 'authorization_code'
	});

	const authOptions = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
		},
		body: body.toString()
	};

	const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
	const data = await response.json();

	access_token = data.access_token;
	refresh_token = data.refresh_token;

	return access_token

}

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	console.log('Congratulations, your extension "pitchblack" is now active!');

	const provider = new MyWebviewViewProvider(context.extensionUri);

    // Register the provider with the unique ID from package.json
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('pitchblack.myWebviewView', provider)
    );

	if (context.globalState.get('access_token') === undefined) {
		let codePromise = callbackServer()
		await authenticate()
		let code = await codePromise
		let token = await getToken(code)
		await context.globalState.update('access_token', token)
		let data = await spotify.getPlaylists(token)
		if (provider._view) {
			provider._view.webview.postMessage({ command: 'setPlaylists', playlists: data.items })
		} else {
			provider._playlists = data.items
		}
	} else {
		let token = context.globalState.get('access_token')
		let data = await spotify.getPlaylists(token)
		if (provider._view) {
			provider._view.webview.postMessage({ command: 'setPlaylists', playlists: data.items })
		} else {
			provider._playlists = data.items
		}
	}
}

class MyWebviewViewProvider {
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
    }

    resolveWebviewView(webviewView, context, token) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		if (this._playlists) {
			this._view.webview.postMessage({ command: 'setPlaylists', playlists: this._playlists })
		}
    }

    _getHtmlForWebview(webview) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <body>
				<div id="playlists"></div>
				<script>
					window.addEventListener('message', async event => {
						const message = event.data;
						switch(message.command) {
							case 'setPlaylists':
								document.getElementById('playlists').innerHTML = message.playlists.map(item => {
									return '<img src="' + item.images[0].url + '"/><h3>' + item.name + '</h3>'
								}).join('')

								break
							default:
								return '<h3>Currently no content<h3>'
						}
					});
				</script>
            </body>
            </html>`;
    }
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
