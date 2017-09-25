
import tinycolor from 'tinycolor2'

export default function dominantColor (colorArray) {
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

  return [ dominantR, dominantG, dominantB ]
}
