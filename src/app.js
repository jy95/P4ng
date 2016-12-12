const {app, BrowserWindow} = require('electron')
const url = require('url')
const props = require('./properties-loader.js')

const exec = require('child_process').exec
const gamepad_cmd = 'node ./src/client/controller/gamepad-controller.js'


exec(gamepad_cmd, function(error, stdout, stderr) {
    console.log('executing..')
    if (error) {
        console.log('oops..')
    }
})

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

