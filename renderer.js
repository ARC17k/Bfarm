// renderer.js
const { ipcRenderer } = window.electron;

const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const statusDiv = document.getElementById('status');

const downloadButton = document.getElementById('downloadButton');

let file_path;

fileInput.addEventListener('change', (event) => {
    file_path = event.target.files[0].path;

    console.log('Selected file:', file_path);
});

uploadButton.addEventListener('click', (event) => {
    
    if (file_path) {
        ipcRenderer.send('uploadFile', file_path);
    }
    console.log('uploadButton');
});

downloadButton.addEventListener('click',(event) => {

    ipcRenderer.send('downloadFile');
});

// Remove ipcRenderer.on() method call from renderer.js
