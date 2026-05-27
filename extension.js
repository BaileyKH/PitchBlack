

const vscode = require('vscode');
require('dotenv').config();

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
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pitchblack" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('pitchblack.startListening', async function () {
		let codePromise = callbackServer()
		await authenticate()
		let code = await codePromise
		getToken(code)

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
