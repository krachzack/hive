
import getRgbaPalette from 'get-rgba-palette'
import tinycolor from 'tinycolor2'

const paletteColorCount = 4
// Higher value means more speed less accuracy
const filterStepSize = 1

export default function dominantColor (rgbaColorArray) {
  const rgbPalette = getRgbaPalette(rgbaColorArray, paletteColorCount, filterStepSize, filter)

  // Flatten the returned palette into an inerleaved RGB array without alpha channel
  // The library does not provide an alpha channel anyway
  return rgbPalette.reduce((acc, [r, g, b]) => acc.concat(r, g, b), [])
}

function filter (arr, idx) {
  const r = arr[idx]
  const g = arr[idx + 1]
  const b = arr[idx + 2]

  const { s, v } = tinycolor({r, g, b}).toHsv()

  return s > 0.4 && v > 0.2
}
