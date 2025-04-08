export default class Task {
  constructor(title, description = '') {
    this.id = Date.now()
    this.title = title
    this.description = description
  }
}