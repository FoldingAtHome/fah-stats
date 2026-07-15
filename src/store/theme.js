// Light/dark theme, persisted to localStorage; light is the default. The active
// theme is reflected as a `data-theme` attribute on <html>, which drives the CSS
// custom properties in base.styl. index.html sets the attribute early (pre-app)
// to avoid a flash; this store keeps it in sync after boot.
import {reactive} from 'vue'

const KEY   = 'theme'
const saved = (() => {try {return localStorage.getItem(KEY)} catch (e) {return null}})()

const theme = reactive({name: saved === 'dark' ? 'dark' : 'light'})

function apply() {
  document.documentElement.setAttribute('data-theme', theme.name)
  try {localStorage.setItem(KEY, theme.name)} catch (e) {}
}

export function toggleTheme() {
  theme.name = theme.name === 'dark' ? 'light' : 'dark'
  apply()
}

apply()

export default theme
