import { desktopCapturer } from 'electron'

const useAudio = false
const updateInterval = 100

export default function desktopCapture (updateFunc) {
  const video = createVideoElement()
  const [ canvas, ctx ] = createCanvasElementAndCtx()

  desktopCapturer.getSources({types: ['screen']}, (error, sources) => {
    if (error) {
      console.error('Error finding media source for desktop capturing')
      throw error
    }

    // If one is named Entire Screen, take that one, otherwise try
    // Screen 1, if that is also unavailable, take the first source
    const bestSource = sources.find(s => s.name === 'Entire screen') ||
                       sources.find(s => s.name === 'Screen 1') ||
                       sources[0]

    if (!bestSource) {
      // If none of the above found a suitable source and there is no first element either, mission abort
      throw new Error('No media source for desktop capturing found')
    }

    // As per documentation, this should be working, but it does only work on windows
    // Showcase of the error: https://github.com/mhashmi/electron-desktop-capture
    // https://github.com/electron/electron/issues/10515
    // https://github.com/electron/electron/issues/4776
    const videoAndAudioOpts = {
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop'
        }
      },
      video: {
        mandatory: {
          chromeMediaSource: 'desktop'
        }
      }
    }

    // If not using audio, it always works
    const videoOnlyOpts = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: bestSource.id,
          minWidth: 112,
          maxWidth: 112,
          minHeight: 63,
          maxHeight: 63,
          maxFrameRate: 30
        }
      }
    }

    const opts = useAudio ? videoAndAudioOpts : videoOnlyOpts

    console.log('Capturing source: ', bestSource)

    // This breaks: navigator.mediaDevices.getUserMedia(opts, handleStream, handleError)
    // but the following version works:
    navigator.getUserMedia(opts, handleStream, handleError)
  })

  function handleStream (stream) {
    video.src = URL.createObjectURL(stream)
    video.onloadedmetadata = updateSelectedColorFromDesktop
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

    setTimeout(updateSelectedColorFromDesktop, updateInterval)
  }
}

function createVideoElement () {
  const video = document.createElement('video')
  video.style.display = 'none'
  video.autoplay = true
  video.defaultMuted = true

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
