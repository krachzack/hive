import { screenCapture } from './screenCapture'
import { ipcRenderer } from 'electron'

if (!document.querySelector('#app')) {
  captureMain()
}

function captureMain () {
  screenCapture(function (color) {
    ipcRenderer.send('screen-color-change', color)
  })
}
