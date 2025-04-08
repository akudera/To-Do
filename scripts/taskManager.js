import Task from './task.js'

export default class TaskManager {
  #modalInstance
  #selectors = {
    taskList: '[data-js-task-list]',
  }

  #ids = {
    closeModalBtn: 'closeModal',
    modalInput: 'modalInput',
    modalDescriptionInput: 'modalDescriptionInput',
    createTaskBtn: 'createTask',
    addTask: 'addTask',
    searchInput: 'searchInput',
  }

  #tasks = []

  constructor(modalInstance) {
    this.#modalInstance = modalInstance

    this.TaskListElement = document.querySelector(this.#selectors.taskList)
    this.modalTitleInput = document.getElementById(this.#ids.modalInput)
    this.modalDescriptionInput = document.getElementById(this.#ids.modalDescriptionInput)
    this.searchInput = document.getElementById(this.#ids.searchInput)

    this.renderTasks()
  }

  renderTasks(taskToRender = this.#tasks) {
    if (taskToRender.length === 0) {
      if (!this.TaskListElement.querySelector('.main__item--info')) {
        this.TaskListElement.innerHTML = '<li class="main__item main__item--info">Список дел пока пуст.</li>'
      }
    } else {
      this.TaskListElement.innerHTML = ''
      taskToRender.forEach((task) => {
        const newTask = document.createElement('li')
    
        newTask.textContent = task.title
        newTask.dataset.id = task.id
        newTask.setAttribute('data-js-task', '')
        newTask.classList.add('main__item')
    
        this.TaskListElement?.appendChild(newTask)
      })
    }
  }

  addTask() {
    if (this.modalTitleInput.value.trim()) {
      const title = this.modalTitleInput.value.trim()
      const description = this.modalDescriptionInput.value.trim()
      
      const task = new Task(title, description)
      this.#tasks.push(task)
      
      const newTask = document.createElement('li')
    
      newTask.textContent = task.title
      newTask.dataset.id = task.id
      newTask.setAttribute('data-js-task', '')
      newTask.classList.add('main__item')
  
      this.TaskListElement?.appendChild(newTask)
      this.TaskListElement?.querySelector('.main__item--info')?.remove()
  
      this.modalTitleInput.value = ''
      this.modalDescriptionInput.value = ''

      this.#modalInstance.closeModal()
    } else {
      this.#modalInstance.showError('Укажите заголовок задачи!')
      this.modalTitleInput.focus()
    }
  }

  filterTasks(value) {
    if (!value) {
      this.TaskListElement.querySelectorAll(':not(.main__item--info)').forEach((task) => {
        task.classList.remove('hidden')
      })
      this.TaskListElement.querySelector('[data-js-not-found]')?.remove()
      return
    }

    if (this.TaskListElement.querySelectorAll(':not(.main__item--info)').length > 0) {
      const search = value.toLowerCase().trim()
      this.TaskListElement.querySelectorAll(':not(.main__item--info)').forEach((task) => {
        if (task.textContent.toLowerCase().includes(search)) {
          task.classList.remove('hidden')
        } else {
          task.classList.add('hidden')
        }
      })
    }

    const visibleTasks = this.TaskListElement.querySelectorAll(':not(.main__item--info):not(.hidden)')
    if (visibleTasks.length === 0 && !this.TaskListElement.querySelector('.main__item--info')) {
      const notFoundMessage = document.createElement('li')
      notFoundMessage.textContent = 'По вашему запросу ничего не найдено :('
      notFoundMessage.classList.add('main__item', 'main__item--info')
      notFoundMessage.setAttribute('data-js-not-found', '')

      this.TaskListElement.appendChild(notFoundMessage)
    } 
    if (visibleTasks.length > 0) {
      this.TaskListElement.querySelector('[data-js-not-found]')?.remove()
    }
  }
}