import desktopCapture from './desktop-capture'
import averageColor from './average-color'
import enhanceColor from './enhance-color'
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

    let desktopColor = averageColor(imageData)
    desktopColor = enhanceColor(desktopColor)
    desktopColor = new Uint8Array(desktopColor)

    console.log(desktopColor)

    ipcRenderer.send('screen-color-change', desktopColor)
  })
}
