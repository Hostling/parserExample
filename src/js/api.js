let socket = io();
const loadingDiv = document.querySelector('div#loading');
const table = document.querySelector('#main > table > tbody');

socket.emit('load');

socket.on('newLink', (msg) => {
  loadingDiv.innerText = 'Processing SKU: ' + msg;
});

socket.on('newLine', (msg) => {
  table.innerHTML += msg;
  loadingDiv.innerText = '';
});
