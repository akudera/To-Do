export default class Task {
  constructor(title, description = '', id = String(Date.now()), isComplete = false) {
    this.id = id
    this.title = title
    this.description = description
    this.isComplete = isComplete
  }
}