export default class Task {
  constructor(title, description = '', id = String(Date.now())) {
    this.id = id
    this.title = title
    this.description = description
  }
}