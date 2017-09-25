import { desktopCapturer } from 'electron'

export default function desktopCapture (updateFunc) {
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

      updateFunc(
        { width: w, height: h, imageData }
      )
    }

    setTimeout(updateSelectedColorFromDesktop, 100)
  }
}

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

function handleError (e) {
  console.error('Desktop capture initialization failed', e)
}
