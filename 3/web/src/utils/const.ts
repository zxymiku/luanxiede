import { useColorModeValue } from "@hope-ui/solid"

export const hoverColor = () => "rgba(132,133,141,0.18)"

export const alphaColor = (level: number, reverse = false) => {
  if (reverse) {
    return useColorModeValue(`$blackAlpha${level}`, `whiteAlpha${level}`)()
  }
  return useColorModeValue(`$whiteAlpha${level}`, `blackAlpha${level}`)()
}

export const alphaBgColor = () =>
  useColorModeValue("$whiteAlpha10", "$blackAlpha11")()
