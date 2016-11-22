const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const gameLogic = require('./common/model/game-logic/game-logic.js')

// Global ref to window to avoid garbage collection
let win

function createWindow(){
    win = new BrowserWindow({width: 800, height: 600, icon: '/home/tall/Téléchargements/Firefox/Jacques_1.png'})
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'common/view/html/game-view.html'),
        protocol: 'file:',
        slashes: true
    }))

    win.on('closed', ()=>{
        app.quit()
    })
}



app.on('ready', ()=>{
    createWindow()
})
