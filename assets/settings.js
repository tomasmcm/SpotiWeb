const Mousetrap = require('mousetrap-record')(require('mousetrap'));
const electron = require('electron');
const Config = require('electron-config');
const config = new Config({name: 'spotiweb-config'});
const ipcRenderer = electron.ipcRenderer;

const configName = electron.remote.getGlobal('configName');

function recordSequence(cmd) {
    Mousetrap.record(function(sequence) {
        // sequence is an array like ['ctrl+k', 'c']
        // Pick the first shortcut from sequence
        let shortcut = sequence[0];

        let inputEl = document.querySelector('#shortcut-' + cmd);
        inputEl.value = shortcut;
    });
}

function openShortcutHelp() {
	electron.shell.openExternal('https://github.com/electron/electron/blob/master/docs/api/accelerator.md');
}

function populateSettings() {
	// Keyboard shortcuts
	const shortcuts = config.get('shortcuts');
	const next = shortcuts.next;
	const prev = shortcuts.prev;
	const play = shortcuts.play;

	/*console.log('Current shortcut keys');
	console.log(`Play: ${play}`);
	console.log(`Next: ${next}`);
	console.log(`Prev: ${prev}`);*/

	const playEl = document.querySelector('#shortcut-play');
	const nextEl = document.querySelector('#shortcut-next');
	const prevEl = document.querySelector('#shortcut-prev');

	playEl.value = play;
	nextEl.value = next;
	prevEl.value= prev;
}

function save() {
	// Save the settings

	const playEl = document.querySelector('#shortcut-play');
	const nextEl = document.querySelector('#shortcut-next');
	const prevEl = document.querySelector('#shortcut-prev');

	const shortcutPlay = playEl.value;
	const shortcutNext = nextEl.value;
	const shortcutPrev = prevEl.value;

	config.store = {
		shortcuts: {
			next: shortcutNext,
			prev: shortcutPrev,
			play: shortcutPlay
		}
	}

	alert('Settings saved');

	// Try to set the keyboard shortcuts
	ipcRenderer.send('set-keyboard-shortcuts');
}

ipcRenderer.on('set-shortcuts-success', (e, success) => {
	if (success) {
		alert('Keyboard shortcuts successfully set');
	} else {
		alert('Keyboard shortcut(s) could not be set. One or more of your keyboard shortcuts are invalid.');
	}
});

function domLoaded() {
	populateSettings();
}
