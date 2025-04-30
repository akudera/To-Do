import Task from './task.js'

export default class StorageManager {
  storageKey
  
  constructor(tasks) {
    this.tasks = tasks
    this.storageKey = 'todoTasks'
  }

  loadTasksFromLocalStorage() {
    const storageTasks = localStorage.getItem(this.storageKey)
    if (storageTasks) {
      try {
        const parsedStorageTasks = JSON.parse(storageTasks)
        return parsedStorageTasks.map((task) => new Task(task.title, task.description, task.id, task.isComplete))
      } catch (error) {
        console.error("Ошибка при парсинге задачи из LocalStorage:", error)
      }      
    }
  }

  saveTasksToLocalStorage(tasks) {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks))
  }
}