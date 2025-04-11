import Task from './task.js'

export default class TaskManager {
  #modalInstance
  #editTaskId
  
  #selectors = {
    taskList: '[data-js-task-list]',
    modalTitle: '[data-js-modal-title]',
  }

  #ids = {
    closeModalBtn: 'closeModal',
    modalInput: 'modalInput',
    modalDescriptionInput: 'modalDescriptionInput',
    createTaskBtn: 'createTask',
    addTask: 'addTask',
    searchInput: 'searchInput',
    addTaskButton: 'addTask',
    createTask: 'createTask',
    editTaskButton: 'editTask'
  }

  #storageKey = 'todoTasks'
  #tasks = []

  constructor(modalInstance) {
    this.#modalInstance = modalInstance

    this.TaskListElement = document.querySelector(this.#selectors.taskList)
    this.modalTitleInput = document.getElementById(this.#ids.modalInput)
    this.modalDescriptionInput = document.getElementById(this.#ids.modalDescriptionInput)
    this.searchInput = document.getElementById(this.#ids.searchInput)
    this.addTaskButton = document.getElementById(this.#ids.addTaskButton)
    this.modalTitle = document.querySelector(this.#selectors.modalTitle)
    this.createTaskButton = document.getElementById(this.#ids.createTask)
    this.editTaskButton = document.getElementById(this.#ids.editTaskButton)

    this.TaskListElement.addEventListener('click', (event) => {
      if (event.target.classList.contains('main__task-delete-button')) {
        const taskIndexToDelete = this.#tasks.findIndex((task) => String(task.id) === String(event.target.closest('[data-js-task]').dataset.id))

        if (taskIndexToDelete !== -1) {
          this.deleteTask(event.target.closest('[data-js-task]'), taskIndexToDelete)
        } else {
          console.warn(`Задача с ID ${event.target.parentElement.dataset.id} не найдена в массиве`);
        }
        return
      }

      if (event.target.hasAttribute('data-js-task') || event.target.classList.contains('main__task-title')) {
        const target = event.target.closest('[data-js-task]')
        this.editTaskMenu(target.querySelector('.main__task-title').textContent, this.getDescription(target.dataset.id), target.dataset.id)
      }
    })

    this.bindAddTaskEnterEvent = this.addTaskEnterEvent.bind(this)
    this.bindEditTaskEnterEvent = this.editTaskEnterEvent.bind(this)

    this.modalTitleInput.addEventListener('keydown', this.bindAddTaskEnterEvent)

    this.createTaskButton.addEventListener('click', () => {this.addTask()})

    this.addTaskButton.addEventListener('click', () => {
      this.attachAddEnterEvent()
      this.editTaskButton.classList.add('hidden')
      this.createTaskButton.classList.remove('hidden')
      this.#modalInstance.openModal()
      this.modalTitleInput.focus()
    })

    this.editTaskButton.addEventListener('click', (event) => {
      event.preventDefault()
      this.editTaskEvent(event, this.#editTaskId)
    })

    this.loadTasksFromLocalStorage()
    this.renderTasks()
  }

  addTaskEnterEvent(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.addTask()
    }
  }

  editTaskEnterEvent(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.editTaskEvent(event, this.#editTaskId)
    }
  }

  attachAddEnterEvent() {
    this.modalTitleInput.removeEventListener('keydown', this.bindEditTaskEnterEvent)
    this.modalTitleInput.addEventListener('keydown', this.bindAddTaskEnterEvent)
  }

  attachEditEnterEvent() {
    this.modalTitleInput.removeEventListener('keydown', this.bindAddTaskEnterEvent)
    this.modalTitleInput.addEventListener('keydown', this.bindEditTaskEnterEvent)
  }

  deleteTask(taskElement, taskIndexToDelete) {
    this.#tasks.splice(taskIndexToDelete, 1)
    this.saveTasksToLocalStorage()

    taskElement.remove()
    this.filterTasks(this.searchInput.value)
  }

  editTaskEvent(event, taskId) {
    event.preventDefault()
    if (this.modalTitleInput.value.trim()) {
      const title = this.modalTitleInput.value.trim()
      const description = this.modalDescriptionInput.value.trim()
      
      const task = this.#tasks.find((task) => String(taskId) === String(task.id))
      if (task) {
        task.title = title
        task.description = description
        this.saveTasksToLocalStorage()
        
        const taskTitleElement = this.TaskListElement.querySelector(`[data-id="${taskId}"] .main__task-title`)
        taskTitleElement.textContent = title
      }
  
      this.modalTitleInput.value = ''
      this.modalDescriptionInput.value = ''
      this.searchInput.value = ''

      this.#modalInstance.closeModal()
    } else {
      this.#modalInstance.showError('Укажите заголовок задачи!')
      this.modalTitleInput.focus()
    }
    this.editTaskButton.classList.add('hidden')
  }

  loadTasksFromLocalStorage() {
    const storageTasks = localStorage.getItem(this.#storageKey)
    if (storageTasks) {
      try {
        const parsedStorageTasks = JSON.parse(storageTasks)
        this.#tasks = parsedStorageTasks.map((task) => new Task(task.title, task.description, task.id))
      } catch (error) {
        console.error("Ошибка при парсинге задачи из LocalStorage:", error)
      }      
    }
  }

  saveTasksToLocalStorage() {
    localStorage.setItem(this.#storageKey, JSON.stringify(this.#tasks))
  }

  renderTasks(taskToRender = this.#tasks) {
    if (taskToRender.length === 0) {
      if (!this.TaskListElement.querySelector('.main__item--info')) {
        this.TaskListElement.innerHTML = '<li class="main__item main__item--info">Список дел пока пуст.</li>'
      }
    } else {
      this.TaskListElement.innerHTML = ''
      taskToRender.forEach((task) => {
        this.TaskListElement?.appendChild(this.createTaskElement(task))
      })
    }
  }

  getDescription(taskId) {
    const task = this.#tasks.find((task) => task.id === taskId)
    return task?.description || ''
  }

  editTaskMenu(title, description, taskId) {
    this.#editTaskId = taskId
    this.attachEditEnterEvent()
    this.createTaskButton.classList.add('hidden')
    this.editTaskButton.classList.remove('hidden')
    this.modalTitle.textContent = 'Редактировать задачу'
    this.modalTitleInput.value = title
    this.modalDescriptionInput.value = description
    this.#modalInstance.openModal()
  }

  createTaskElement(task) {
    const newTask = document.createElement('li')
    
    newTask.dataset.id = task.id
    newTask.setAttribute('data-js-task', '')
    newTask.classList.add('main__item')

    const newTaskTitle = document.createElement('span')
    newTaskTitle.textContent = task.title
    newTaskTitle.classList.add('main__task-title')

    newTask.appendChild(newTaskTitle)

    const deleteTaskButton = document.createElement('button')
    deleteTaskButton.classList.add('main__task-delete-button')
    deleteTaskButton.ariaLabel = 'Удалить задачу'
    deleteTaskButton.title = 'Удалить задачу'
    newTask.appendChild(deleteTaskButton)
    
    return newTask
  }

  addTask() {
    if (this.modalTitleInput.value.trim()) {
      const title = this.modalTitleInput.value.trim()
      const description = this.modalDescriptionInput.value.trim()
      
      const task = new Task(title, description)
      this.#tasks.push(task)
      this.saveTasksToLocalStorage()
      
      this.TaskListElement?.appendChild(this.createTaskElement(task))
      this.TaskListElement?.querySelector('.main__item--info')?.remove()
  
      this.modalTitleInput.value = ''
      this.modalDescriptionInput.value = ''
      this.searchInput.value = ''
      this.filterTasks('')

      this.#modalInstance.closeModal()
    } else {
      this.#modalInstance.showError('Укажите заголовок задачи!')
      this.modalTitleInput.focus()
    }
  }

  filterTasks(value) {
    if (!value) {
      this.TaskListElement.querySelectorAll('li.hidden:not(.main__item--info)').forEach((task) => {
        task.classList.remove('hidden')
      })
      this.TaskListElement.querySelector('[data-js-not-found]')?.remove()
      if (this.#tasks.length === 0) {
        if (!this.TaskListElement.querySelector('.main__item--info')) {
          this.TaskListElement.innerHTML = '<li class="main__item main__item--info">Список дел пока пуст.</li>'
        }
      }
      return
    }

    if (this.TaskListElement.querySelectorAll('li:not(.main__item--info)').length > 0) {
      const search = value.toLowerCase().trim()
      this.TaskListElement.querySelectorAll('li:not(.main__item--info)').forEach((task) => {
        if (task.textContent.toLowerCase().includes(search)) {
          task.classList.remove('hidden')
        } else {
          task.classList.add('hidden')
        }
      })
    }

    const visibleTasks = this.TaskListElement.querySelectorAll('li:not(.main__item--info):not(.hidden)')
    if (visibleTasks.length === 0 && this.#tasks.length !== 0 && !this.TaskListElement.querySelector('.main__item--info')) {
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