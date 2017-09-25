
export default function averageColor (colorArray) {
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

  return [ r, g, b ]
}
