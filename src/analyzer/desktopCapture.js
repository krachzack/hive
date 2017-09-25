import { desktopCapturer } from 'electron'
import tinycolor from 'tinycolor2'

export function desktopCapture (updateFunc) {
  const video = createVideoElement()
  const [ canvas, ctx ] = createCanvasElementAndCtx()

  desktopCapturer.getSources({types: ['screen']}, (error, sources) => {
    if (error) throw error
    for (let i = 0; i < sources.length; ++i) {
      // Filter: main screen
      if (sources[i].name === 'Entire screen') {
        navigator.webkitGetUserMedia({
          audio: false, // TODO analyze the audio!
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sources[i].id,
              minWidth: 112,
              maxWidth: 112,
              minHeight: 63,
              maxHeight: 63,
              maxFrameRate: 30
            }
          }
        }, handleStream, handleError)
        return
      }
    }
  })

  function createVideoElement () {
    const video = document.createElement('video')
    video.style.display = 'none'
    document.body.appendChild(video)
    return video
  }

  function createCanvasElementAndCtx () {
    const canvas = document.createElement('canvas')
    canvas.style.display = 'none'
    document.body.appendChild(canvas)

    const ctx = canvas.getContext('2d')

    return [ canvas, ctx ]
  }

  function handleStream (stream) {
    video.src = URL.createObjectURL(stream)
    updateSelectedColorFromDesktop()
  }

  function updateSelectedColorFromDesktop () {
    const w = video.videoWidth
    const h = video.videoHeight

    if (w > 0) {
      video.width = w
      video.height = h
      canvas.style.width = w
      canvas.style.height = h

      ctx.drawImage(video, 0, 0, w, h)
      const imageData = ctx.getImageData(0, 0, w, h).data

      updateFunc(dominantColor(imageData))
    }

    setTimeout(updateSelectedColorFromDesktop, 100)
  }
}

function dominantColor (colorArray) {
  const channelCount = 4 // rgba

  let dominantR, dominantG, dominantB
  let dominantDominance = -1

  for (let i = 0; (i + (channelCount - 1)) < colorArray.length; i += channelCount) {
    const r = colorArray[i]
    const g = colorArray[i + 1]
    const b = colorArray[i + 2]

    const { h, s, v } = tinycolor({r, g, b}).toHsv()
    const dominance = v * 0.5 + s

    if (dominance > dominantDominance) {
      const rgbVariation = tinycolor({h, s: 100, v: 100}).toRgb()

      dominantR = rgbVariation.r
      dominantG = rgbVariation.g
      dominantB = rgbVariation.b
      dominantDominance = dominance
    }
  }

  return new Uint8Array([dominantR, dominantG, dominantB])
}

/* function averageColor (colorArray) {
  let r = 0
  let g = 0
  let b = 0

  const channelCount = 4 // rgba

  for (let i = 0; (i + (channelCount - 1)) < colorArray.length; i += channelCount) {
    r += colorArray[i]
    g += colorArray[i + 1]
    b += colorArray[i + 2]
  }

  const colorCount = Math.floor(colorArray.length / channelCount)
  r = Math.floor(r / colorCount)
  g = Math.floor(g / colorCount)
  b = Math.floor(b / colorCount)

  return toCss(r, g, b)
} */

function handleError (e) {
  console.error(e)
}
