const {app, BrowserWindow} = require('electron')
const url = require('url')
const props = require('./properties-loader.js')

// Global ref to window to avoid garbage collection
let win

function createWindow(){
    win = new BrowserWindow({
        width: 700,
        height: 700,
        icon: props.p4ngIcon
    })
    win.loadURL(url.format({
        pathname: props.p4ngIndex,
        protocol: 'file:',
        slashes: true
    }))

    win.once('ready-to-show', ()=>{
        init()
    })

    win.on('closed', ()=>{
        app.quit()
    })
}

app.on('ready', ()=>{
    createWindow()
})
