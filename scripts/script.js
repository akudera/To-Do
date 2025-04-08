import TaskManager from './taskManager.js'
import Modal from './modal.js'

const modal = new Modal
const taskManager = new TaskManager(modal)

const addTaskButton = document.getElementById('addTask')
const createTaskButton = document.getElementById('createTask')
const modalTitleInput = document.getElementById('modalInput')
const searchInput = document.getElementById('searchInput')

modalTitleInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    taskManager.addTask()
  }
})

addTaskButton.addEventListener('click', () => {
  modal.openModal()
  modalTitleInput.focus()
})

modal.modalElement.addEventListener('mousedown', (event) => {
  if (event.target === modal.modalElement || event.target === modal.closeModalButton) {
    modal.closeModal()
  }
})

modal.closeModalButton.addEventListener('click', () => {
  modal.closeModal()
})

createTaskButton.addEventListener('click', () => { taskManager.addTask() })

searchInput.addEventListener('input', (event) => { taskManager.filterTasks(event.target.value) })