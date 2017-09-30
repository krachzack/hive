import desktopCapture from './desktop-capture'
import dominantColors from './dominant-colors'
import { ipcRenderer } from 'electron'

// If this is the invisible screen capture window, start
// capturing the screen and send updates to the main process,
// which will update the renderers regularly.
if (document.querySelector('#analyzer-window')) {
  analyzerMain()
}

function analyzerMain () {
  desktopCapture(function (desktopState) {
    const { imageData } = desktopState

    let desktopColors = dominantColors(imageData)
    desktopColors = new Uint8Array(desktopColors)

    ipcRenderer.send('screen-color-change', desktopColors)
  })
}
