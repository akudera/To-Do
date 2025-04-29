export default class ThemeSwitcher {
  #storageKey

  selectors = {
    switchThemeButton: '[data-js-theme-switcher]',
  }

  themes = {
    dark: 'dark',
    light: 'light'
  }

  stateClasses = {
    isDark: 'is-dark-theme',
  }

  svg = {
    sun: `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none"><g clip-path="url(#a)"><path stroke="#BAF6BA" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.5 1.042v2.083m0 18.75v2.083M4.396 4.396l1.48 1.479m13.25 13.25 1.478 1.48M1.042 12.5h2.083m18.75 0h2.083M4.396 20.604l1.48-1.479m13.25-13.25 1.478-1.48M17.708 12.5a5.208 5.208 0 1 1-10.416 0 5.208 5.208 0 0 1 10.416 0"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h25v25H0z"/></clipPath></defs></svg>`,
    moon: `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.875 13.3229C21.7112 15.096 21.0457 16.7858 19.9565 18.1946C18.8673 19.6033 17.3995 20.6727 15.7247 21.2776C14.0499 21.8826 12.2375 21.998 10.4995 21.6105C8.7615 21.223 7.1698 20.3485 5.91067 19.0893C4.65154 17.8302 3.77704 16.2385 3.38951 14.5005C3.00197 12.7625 3.11743 10.9501 3.72237 9.27531C4.32731 7.60053 5.39672 6.13267 6.80545 5.04349C8.21418 3.95431 9.90397 3.28886 11.6771 3.125C10.639 4.52945 10.1394 6.25984 10.2693 8.00147C10.3992 9.7431 11.1499 11.3803 12.3848 12.6152C13.6198 13.8501 15.2569 14.6008 16.9985 14.7307C18.7402 14.8606 20.4706 14.361 21.875 13.3229Z" stroke="#1E1E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  }

  constructor() {
    this.#storageKey = 'theme'
    this.switchThemeButton = document.querySelector(this.selectors.switchThemeButton)

    this.bindEvents()
    this.setInitialTheme()
  }

  get isDarkThemeCached() {
    if (localStorage.getItem(this.#storageKey)) {
      return localStorage.getItem(this.#storageKey) === this.themes.dark
    } else {
      return document.documentElement.matches(`.${this.stateClasses.isDark}`)
    }
  }

  bindEvents() {
    this.switchThemeButton.addEventListener('click', () => { this.switchTheme() })
  }

  setIconImage() {
    if (this.isDarkThemeCached) {
      this.switchThemeButton.innerHTML = this.svg.sun
    } else {
      this.switchThemeButton.innerHTML = this.svg.moon
    }
  }

  setInitialTheme() {
    const isDarkThemeCached = this.isDarkThemeCached

    if (localStorage.getItem(this.#storageKey)) {
      document.documentElement.classList.toggle(this.stateClasses.isDark, isDarkThemeCached)
    } else {
      const colorPrefers = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle(this.stateClasses.isDark, colorPrefers)
    }

    this.setIconImage()
  }

  switchTheme() {
    this.isDarkThemeCached ? localStorage.setItem(this.#storageKey, this.themes.light) : localStorage.setItem(this.#storageKey, this.themes.dark)

    document.documentElement.classList.toggle(this.stateClasses.isDark, this.isDarkThemeCached)
    
    this.setIconImage()
  }
}