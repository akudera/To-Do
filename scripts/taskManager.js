import Task from './task.js'
import StorageManager from './storageManager.js'
import RenderTasks from './renderTasks.js'
import DragAndDrop from './dragAndDrop.js'

export default class TaskManager {
  #storageManager
  #modalInstance
  #dndInstance
  editTaskId
  
  ids = {
    closeModalBtn: 'closeModal',
    modalInput: 'modalInput',
    modalDescriptionInput: 'modalDescriptionInput',
    searchInput: 'searchInput',
    addTaskButton: 'addTask',
    createTask: 'createTask',
    saveEditChanges: 'saveChanges'
  }

  selectors = {
    taskList: '[data-js-task-list]',
    task: '[data-js-task]',
    taskWrapper: '.main__item-wrapper',
    taskTitle: '.main__item-title',
    modalTitle: '[data-js-modal-title]',
    checkbox: '[data-js-checkbox]',
  }

  constructor(modalInstance) {
    this.#modalInstance = modalInstance
    this.#storageManager = new StorageManager()
    this.#dndInstance = new DragAndDrop(10)

    this.TaskListElement = RenderTasks.listElement
    this.modalTitleInput = document.getElementById(this.ids.modalInput)
    this.modalDescriptionInput = document.getElementById(this.ids.modalDescriptionInput)
    this.searchInput = document.getElementById(this.ids.searchInput)
    this.addTaskButton = document.getElementById(this.ids.addTaskButton)
    this.modalTitle = document.querySelector(this.selectors.modalTitle)
    this.createTaskButton = document.getElementById(this.ids.createTask)
    this.saveEditChangesButton = document.getElementById(this.ids.saveEditChanges)

    this.bindEvents()
    RenderTasks.renderTasks()
  }

  debounce(callback, ms = 200) {
    let timeout
    
    return function(...args) {
      clearTimeout(timeout)

      timeout = setTimeout(() => {
        callback.apply(this, args)
      }, ms)
    }
  }

  bindEvents() {
    this.TaskListElement.addEventListener('click', (event) => { this.onTaskClick(event) })

    this.bindAddTaskEnterEvent = this.addTaskEnterEvent.bind(this)
    this.bindEditTaskEnterEvent = this.editTaskEnterEvent.bind(this)

    this.modalTitleInput.addEventListener('keydown', this.bindAddTaskEnterEvent)

    this.createTaskButton.addEventListener('click', () => { this.addTask() })

    this.addTaskButton.addEventListener('click', () => { this.onAddTaskBtnClick() })

    this.saveEditChangesButton.addEventListener('click', (event) => { this.onEditTaskBtnClick(event) })
  }

  onEditTaskBtnClick(event) {
    event.preventDefault()
    this.editTaskEvent(event, this.editTaskId)  
  }

  onAddTaskBtnClick() {
    this.attachAddEnterEvent()
    this.saveEditChangesButton.classList.add('hidden')
    this.createTaskButton.classList.remove('hidden')
    this.#modalInstance.openModal()
    this.modalTitleInput.focus()
  }

  onTaskClick(event) {
    if (event.target.matches('.main__item-delete-button')) {
      const deleteTask = event.target.closest(this.selectors.task)
      const confirmDelete = confirm(`Удалить задачу ${deleteTask.querySelector(this.selectors.taskTitle)?.textContent || ''} ?`)

      if (!confirmDelete) return

      const taskIndexToDelete = RenderTasks.tasks.findIndex((task) => String(task.id) === String(event.target.closest(this.selectors.task).dataset.id))

      if (taskIndexToDelete !== -1) {
        this.deleteTask(deleteTask, taskIndexToDelete)
      }
      
      return
    }

    if (event.target.matches(this.selectors.checkbox)) {
      this.changeTaskStatus(event.target)
    }

    if (event.target.matches(this.selectors.taskWrapper) || event.target.matches(this.selectors.taskTitle)) {
      const target = event.target.closest(this.selectors.task)
      this.editTaskMenu(target.querySelector(this.selectors.taskTitle).textContent, this.getDescription(target.dataset.id), target.dataset.id)
    }
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
      this.editTaskEvent(event, this.editTaskId)
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
    RenderTasks.tasks.splice(taskIndexToDelete, 1)
    this.#storageManager.saveTasksToLocalStorage(RenderTasks.tasks)

    taskElement.remove()
    
    this.filterTasks(this.searchInput.value)
    this.#dndInstance.resetDragMode()
  }

  changeTaskStatus(checkbox) {
    const taskElement = checkbox.closest(this.selectors.task)
    const taskId = taskElement.dataset.id

    const task = RenderTasks.tasks.find((task) => String(task.id) === String(taskId))
    if (!task) return
    
    task.isComplete = checkbox.checked
    this.#storageManager.saveTasksToLocalStorage(RenderTasks.tasks)
  }

  editTaskEvent(event, taskId) {
    event.preventDefault()
    if (this.modalTitleInput.value.trim()) {
      const title = this.modalTitleInput.value.trim()
      const description = this.modalDescriptionInput.value.trim()
      
      const task = RenderTasks.tasks.find((task) => String(taskId) === String(task.id))
      if (task) {
        task.title = title
        task.description = description
        this.#storageManager.saveTasksToLocalStorage(RenderTasks.tasks)
        
        const taskTitleElement = this.TaskListElement.querySelector(`[data-id="${taskId}"] ${this.selectors.taskTitle}`)
        taskTitleElement.textContent = title
      }
  
      this.modalTitleInput.value = ''
      this.modalDescriptionInput.value = ''
      this.filterTasks(this.searchInput.value)

      this.#modalInstance.closeModal()
    } else {
      this.#modalInstance.showError('Укажите заголовок задачи!')
      this.modalTitleInput.focus()
    }
  }
  
  getDescription(taskId) {
    const task = RenderTasks.tasks.find((task) => task.id === taskId)
    return task?.description || ''
  }

  editTaskMenu(title, description, taskId) {
    this.editTaskId = taskId
    this.attachEditEnterEvent()
    this.createTaskButton.classList.add('hidden')
    this.saveEditChangesButton.classList.remove('hidden')
    this.modalTitle.textContent = 'Редактировать задачу'
    this.modalTitleInput.value = title
    this.modalDescriptionInput.value = description
    this.#modalInstance.openModal()
  }

  addTask() {
    if (this.modalTitleInput.value.trim()) {
      const title = this.modalTitleInput.value.trim()
      const description = this.modalDescriptionInput.value.trim()
      
      const task = new Task(title, description)
      RenderTasks.tasks.unshift(task)
      this.#storageManager.saveTasksToLocalStorage(RenderTasks.tasks)
      
      this.TaskListElement?.prepend(RenderTasks.createTaskElement(task))
      this.TaskListElement?.querySelector('.main__item--info')?.remove()
  
      this.modalTitleInput.value = ''
      this.modalDescriptionInput.value = ''
      this.searchInput.value = ''
      this.#dndInstance.resetDragMode()
      this.filterTasks()

      this.#modalInstance.closeModal()
    } else {
      this.#modalInstance.showError('Укажите заголовок задачи!')
      this.modalTitleInput.focus()
    }
  }

  filterTasks(value = '') {
    if (RenderTasks.tasks.length === 0) {
      if (!this.TaskListElement.querySelector('.main__item--info')) {
        this.TaskListElement.innerHTML = '<li class="main__item main__item--info">Список дел пока пуст.</li>'
      }
      return
    }

    if (!value) {
      this.TaskListElement.querySelectorAll('li.hidden:not(.main__item--info)').forEach((task) => {
        task.classList.remove('hidden')
      })
      this.TaskListElement.querySelector('[data-js-not-found]')?.remove()
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
    if (visibleTasks.length === 0 && RenderTasks.tasks.length !== 0 && !this.TaskListElement.querySelector('.main__item--info')) {
      const notFoundMessage = document.createElement('li')
      notFoundMessage.textContent = 'По вашему запросу ничего не найдено :('
      notFoundMessage.classList.add('main__item', 'main__item--info')
      notFoundMessage.setAttribute('data-js-not-found', '')

      this.TaskListElement.append(notFoundMessage)
    } 
    if (visibleTasks.length > 0) {
      this.TaskListElement.querySelector('[data-js-not-found]')?.remove()
    }
  }
}