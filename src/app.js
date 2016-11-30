const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const gameLogic = require('./client/model/game-logic/game-logic.js')

// Global ref to window to avoid garbage collection
let win

function createWindow(){
    win = new BrowserWindow({width: 700, height: 700, icon: path.resolve(`${__dirname}/../ressources/P4ng_logo_1.png`)})
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'client/view/html/game-view.html'),
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
