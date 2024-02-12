// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with your service account credentials
const serviceAccount = require('E:/Shankar/Bfarm/electron-firebase/secure file/electron-firebase-ced3c-firebase-adminsdk-zm2f0-dfe266a88e.json');

console.log("working");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://electron-firebase-ced3c.appspot.com' ,

    // Correct your storage bucket URL here

});

console.log("working");

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false, // Disable nodeIntegration
            contextIsolation: true, // Enable contextIsolation
            preload: path.join(__dirname, 'preload.js') // Specify the path to preload script
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

const bucket = admin.storage().bucket();
const firestore = admin.firestore();

ipcMain.on('uploadFile', async (event, filePath) => {
    try {
        console.log('Received file path:', filePath);       
        
        const options = {
            destination: `data/${path.basename(filePath)}`
        };

        await bucket.upload(filePath, options);

        //make record of upload data
        firestore.collection('renders').doc(`${path.basename(filePath)}`).set({
          frames: 100,
          rframes: 0,
          gpu: true,
          destination: options.destination,
          iurl: await bucket.file(options.destination).getSignedUrl({ action: 'read', expires: '03-09-2491' }),
          ourl: null
        });

        event.reply('fileUploaded', { success: true, message: 'File uploaded successfully' });
    } catch (error) {
        console.error('Error uploading file:', error.message);
        event.reply('fileUploaded', { success: false, message: error.message });
    }
});

//download data
ipcMain.on('downloadFile', async (event) => {
    try{
        console.log("working");
        const options = {
            destination: 'E:/Shankar/Bfarm/test.png'
        };
        await bucket.file('data/0.jpg').download(options);

        console.log("downloaded");

        event.reply('fileDownloaded', { success: true, message: 'File downloaded successfully' });
    }
    catch(error){
      console.error('Error downloading file:', error.message);
      event.reply('fileDownload', { success: false, message: error.message });
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
