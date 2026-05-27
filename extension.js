import { stat } from 'node:fs';
import * as vscode from 'vscode'

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
require('dotenv').config()

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

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
	const disposable = vscode.commands.registerCommand('pitchblack.startListening', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from PitchBlack!');
		authenticate()
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
