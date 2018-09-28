export const env = {
  REACT_APP_API_HOST: getEnvStr('REACT_APP_API_HOST'),
  REACT_APP_LCD_API_HOST: getEnvStr('REACT_APP_LCD_API_HOST'),
}

function getEnvStr (key: string, defaultValue?: string): string {
  const value = process.env[key]
  if (value === undefined) {
    if (defaultValue === undefined) { throw new Error(`Required env variable "${key}" not found in .env`) }
    return defaultValue
  }
  return value
}
