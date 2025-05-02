import StorageManager from "./storageManager"

export default class RenderTasks {
  static #storageManagerInstance = new StorageManager()

  static selectors = {
    taskList: '[data-js-task-list]',
    checkbox: '[data-js-checkbox]',
  }

  static svg = {
    urnIcon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m10 12 4 4m0-4-4 4M4 6h16m-4 0-.27-.812c-.263-.787-.394-1.18-.637-1.471a2 2 0 0 0-.803-.578C13.939 3 13.524 3 12.695 3h-1.388c-.829 0-1.244 0-1.596.139a2 2 0 0 0-.803.578c-.243.29-.374.684-.636 1.471L8 6m10 0v10.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C15.72 21 14.88 21 13.2 21h-2.4c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C6 18.72 6 17.88 6 16.2V6"/></svg>',
    dndButtonIcon: '<svg viewBox="0 0 15 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.13281 3.02813C6.13281 1.61719 4.90781 0.46875 3.39844 0.46875C1.88906 0.46875 0.664062 1.61719 0.664062 3.02813C0.664062 4.44125 1.88906 5.5875 3.39844 5.5875C4.90781 5.5875 6.13281 4.44125 6.13281 3.02813ZM6.13281 21.9719C6.13281 20.5588 4.90781 19.4125 3.39844 19.4125C1.88906 19.4125 0.664062 20.5588 0.664062 21.9719C0.664062 23.3828 1.88906 24.5312 3.39844 24.5312C4.90781 24.5312 6.13281 23.3828 6.13281 21.9719ZM3.39844 9.94063C4.90781 9.94063 6.13281 11.0891 6.13281 12.5C6.13281 13.9109 4.90781 15.0594 3.39844 15.0594C1.88906 15.0594 0.664062 13.9109 0.664062 12.5C0.664062 11.0891 1.88906 9.94063 3.39844 9.94063ZM14.3359 3.02813C14.3359 1.61719 13.1109 0.46875 11.6016 0.46875C10.0922 0.46875 8.86719 1.61719 8.86719 3.02813C8.86719 4.44125 10.0922 5.5875 11.6016 5.5875C13.1109 5.5875 14.3359 4.44125 14.3359 3.02813ZM11.6016 19.4125C13.1109 19.4125 14.3359 20.5588 14.3359 21.9719C14.3359 23.3828 13.1109 24.5312 11.6016 24.5312C10.0922 24.5312 8.86719 23.3828 8.86719 21.9719C8.86719 20.5588 10.0922 19.4125 11.6016 19.4125ZM14.3359 12.5C14.3359 11.0891 13.1109 9.94063 11.6016 9.94063C10.0922 9.94063 8.86719 11.0891 8.86719 12.5C8.86719 13.9109 10.0922 15.0594 11.6016 15.0594C13.1109 15.0594 14.3359 13.9109 14.3359 12.5Z" fill="#669966"/></svg>',
  }

  static _taskListElement = document.querySelector(this.selectors.taskList)
  static #_tasks = RenderTasks.#storageManagerInstance.loadTasksFromLocalStorage() || []

  
  static get listElement() {
    return this._taskListElement
  }

  static set listElement(listElement) {
    this._taskListElement = listElement
  }

  static get tasks() {
    return this.#_tasks
  }
    
  static set tasks(tasks) {
    this.#_tasks = tasks
  }
  
  static renderTasks(taskToRender = this.tasks) {
    if (taskToRender.length === 0) {
      if (!this.listElement.querySelector('.main__item--info')) {
        this.listElement.innerHTML = '<li class="main__item main__item--info">Список дел пока пуст.</li>'
      }
    } else {
      this.listElement.innerHTML = ''
      taskToRender.forEach((task) => {
        const taskElement = this.createTaskElement(task)
        this.listElement?.append(taskElement)

        if (task.isComplete) {
          const checkbox = taskElement.querySelector(this.selectors.checkbox)
          checkbox.checked = true
        }
      })
    }
  }

  static createTaskElement(task) {
    const newTaskElement = document.createElement('li')
    newTaskElement.dataset.id = task.id
    newTaskElement.dataset.jsTask = ''
    newTaskElement.classList.add('main__item')

    const newTaskInner = document.createElement('div')
    newTaskInner.classList.add('main__item-wrapper')
    newTaskInner.dataset.jsDndElement = ''
    newTaskElement.append(newTaskInner)

    const taskCheckbox = document.createElement('input')
    taskCheckbox.setAttribute('type', 'checkbox')
    taskCheckbox.classList.add('main__item-checkbox')
    taskCheckbox.setAttribute('name', 'taskCheckbox')
    taskCheckbox.dataset.jsCheckbox = ''
    newTaskInner.append(taskCheckbox)

    const taskCustomCheckbox = document.createElement('div')
    taskCustomCheckbox.classList.add('main__item-custom-checkbox')
    newTaskInner.append(taskCustomCheckbox)

    const dndButton = document.createElement('button')
    dndButton.dataset.jsDndButton = ''
    dndButton.innerHTML = this.svg.dndButtonIcon
    dndButton.classList.add('main__item-dnd', 'hidden')
    newTaskInner.append(dndButton)

    const newTaskTitle = document.createElement('span')
    newTaskTitle.textContent = task.title
    newTaskTitle.classList.add('main__item-title')
    newTaskInner.append(newTaskTitle)

    const deleteTaskButton = document.createElement('button')
    deleteTaskButton.classList.add('main__item-delete-button')
    deleteTaskButton.ariaLabel = 'Удалить задачу'
    deleteTaskButton.title = 'Удалить задачу'
    deleteTaskButton.innerHTML = this.svg.urnIcon
    newTaskInner.append(deleteTaskButton)
    
    return newTaskElement
  }
}