
import tinycolor from 'tinycolor2'

/**
 * Returns a more bright and saturated version of the given color.
 *
 * @param Array colorArr 3-component array containing r, g, b
 */
export default function enhanceColor (colorArr) {
  let { h, s, v } = tinycolor({ r: colorArr[0], g: colorArr[1], b: colorArr[2] }).toHsv()
  s = Math.min(100, s + 60)
  v = 100

  const { r, g, b } = tinycolor({ h, s, v }).toRgb()

  return [ r, g, b ]
}
