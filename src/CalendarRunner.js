// Simple runner to exercise src/CalendarManager.js in a Node environment using jsdom
// This will call makeCalendar(); due to missing FullCalendar browser runtime,
// the method's try/catch will handle errors and return [].

const { JSDOM } = require('jsdom');
const CalendarManager = require('./CalendarManager.js');

async function run() {
	// Create a minimal DOM with a #calendar container
	const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="calendar"></div></body></html>`, {
		url: 'http://localhost/'
	});
	global.window = dom.window;
	global.document = dom.window.document;
	global.HTMLElement = dom.window.HTMLElement;
	global.CustomEvent = dom.window.CustomEvent;

	// Provide a no-op for the UI callback used in Calendar.js
	global.showGameDetails = function showGameDetails() {};

	const calendarManager = new CalendarManager();
	const result = await calendarManager.makeCalendar();

	console.log('makeCalendar() result:', result);
	console.log('Rendered HTML for #calendar:\n', document.getElementById('calendar').outerHTML);
}

run().catch(err => {
	console.error('Calendar runner failed:', err);
	process.exit(1);
});


