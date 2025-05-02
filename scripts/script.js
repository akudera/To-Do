import '../scss/styles.scss'

import TaskManager from './taskManager.js'
import Modal from './modal.js'
import ThemeSwitcher from './themeSwitcher.js'

new ThemeSwitcher()
const modal = new Modal()
const taskManager = new TaskManager(modal)

const searchInput = document.getElementById('searchInput')

modal.modalElement.addEventListener('mousedown', (event) => {
  if (event.target === modal.modalElement || event.target === modal.closeModalButton) {
    modal.closeModal()
  }
})

modal.modalElement.addEventListener('keydown', (event) => {
  if (event.code === 'Escape') {
    event.preventDefault()
    modal.closeModal()
  }
})

modal.closeModalButton.addEventListener('click', () => {
  modal.closeModal()
})

searchInput.addEventListener('input', taskManager.debounce((event) => taskManager.filterTasks(event.target.value)) )