'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import mdns from 'mdns'
import hash from 'string-hash'
import atolla from 'atolla'
import throttle from 'lodash.throttle'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const screenCaptureURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/screenCapture.html`
  : `file://${__dirname}/screenCapture.html`

const sinks = []
let screenColor

let screenCaptureWindow

function createWindows () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (!screenCaptureWindow) {
    screenCaptureWindow = new BrowserWindow({
      show: false
    })
    screenCaptureWindow.loadURL(screenCaptureURL)
  }
}

app.on('ready', createWindows)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindows()
  }
})

const pushScreenColorToWindow = throttle(function () {
  mainWindow.webContents.send('screen-color-change', screenColor)
}, 100)

ipcMain.on('sink-service-discover', (event, arg) => browseSinks(event))
ipcMain.on('sink-post', (event, arg) => sinkPost(arg))
ipcMain.on('screen-color-change', function (event, arg) {
  screenColor = arg
  pushScreenColorToWindow()
})

/**
 * Searches for sinks over mdns.
 */
function browseSinks (event) {
  const browser = mdns.createBrowser(mdns.udp('atolla'))
  browser.on('serviceUp', (service) => {
    const sink = excerpt(service)
    handleServiceStatusChange(sink)
  })
  browser.start()

  function excerpt (service) {
    const address = service.addresses.find((addr) => addr.indexOf('.') !== -1)

    return {
      id: hash(address + service.port + service.fullname),
      name: service.name,
      address,
      port: service.port,
      fullname: service.fullname
    }
  }
}

const connectSink = throttle(function connectSinkInner (sink) {
  if (sink.conn) {
    if (sink.conn.state === 'ATOLLA_SOURCE_STATE_ERROR') {
      sink.conn.close()
      sink.connected = false
    } else {
      return
    }
  }

  sink.connected = false

  sink.conn = atolla.source({
    hostname: sink.address,
    port: sink.port,
    frameDurationMs: 30,
    painter: function () {
      let color

      switch (sink.inputMode) {
        case 'picker':
          color = sink.pickerColor
          break

        case 'screen':
          color = screenColor
      }

      return color || new Uint8Array([0, 0, 0])
    },
    onStateChange: function (newState, oldState) {
      const serviceStatusChange = { id: sink.id }

      if (newState === 'ATOLLA_SOURCE_STATE_ERROR') {
        // Try connecting again in 3 seconds
        setTimeout(function () {
          connectSink(sink)
        }, 3000)

        serviceStatusChange.connected = false
      } else if (newState === 'ATOLLA_SOURCE_STATE_OPEN') {
        serviceStatusChange.connected = true
      }

      handleServiceStatusChange(serviceStatusChange)
    }
  })
}, 5000)

function initSink (sink) {
  sink.connected = false
  sink.inputMode = 'picker'
  sink.pickerColor = 'rgb(0,255,0)'
}

function handleServiceStatusChange (changedSink) {
  const existing = sinks.find((existingSink) => existingSink.id === changedSink.id)
  let target

  if (!existing) {
    connectSink(changedSink)
    sinks.push(changedSink)
    initSink(changedSink)
    target = changedSink
  } else {
    if (!existing.conn) {
      connectSink(existing)
    }

    Object.assign(existing, changedSink)
    target = existing
  }

  if (mainWindow) {
    target = Object.assign({}, target)
    delete target.conn
    mainWindow.webContents.send('sink-service-status-change', target)
  }
}

function sinkPost (update) {
  const target = sinks.find((sink) => sink.id === update.id && sink.connected)

  if (target) {
    Object.assign(target, update)
  }
}
