import { desktopCapture } from './desktopCapture'
import { ipcRenderer } from 'electron'

// If this is the invisible screen capture window, start
// capturing the screen and send updates to the main process,
// which will update the renderers regularly.
if (!document.querySelector('#screen-capture-window')) {
  analyzerMain()
}

function analyzerMain () {
  desktopCapture(function (color) {
    ipcRenderer.send('screen-color-change', color)
  })
}
