import RenderTasks from "./renderTasks"
import StorageManager from "./storageManager"
import Task from "./task"

export default class DragAndDrop {
  
  #storageManager
  isDraggingMode = false

  selectors = {
    list: '[data-js-task-list]',
    listElement: '[data-js-task]',
    listElementInner: '[data-js-dnd-element]',
    dndButton: '[data-js-dnd-button]',
    checkbox: '[data-js-checkbox]',
  }

  ids = {
    dragModeButton: 'dndMode',
  }

  stateClasses = {
    isDragging: 'is-dragging'
  }

  initialState = {
    draggableElement: null,
    draggableElementWrapper: null,
    offsetY: null,
  }

  svg = {
    onDndModeIcon: '<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4583 4.16668H4.16667C3.61413 4.16668 3.08423 4.38617 2.69353 4.77687C2.30283 5.16757 2.08333 5.69748 2.08333 6.25001V20.8333C2.08333 21.3859 2.30283 21.9158 2.69353 22.3065C3.08423 22.6972 3.61413 22.9167 4.16667 22.9167H18.75C19.3025 22.9167 19.8324 22.6972 20.2231 22.3065C20.6138 21.9158 20.8333 21.3859 20.8333 20.8333V13.5417M19.2708 2.60418C19.6852 2.18978 20.2473 1.95697 20.8333 1.95697C21.4194 1.95697 21.9814 2.18978 22.3958 2.60418C22.8102 3.01858 23.043 3.58063 23.043 4.16668C23.043 4.75273 22.8102 5.31478 22.3958 5.72918L12.5 15.625L8.33333 16.6667L9.375 12.5L19.2708 2.60418Z" stroke="#1E1E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    offDndModeIcon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /></svg>'
  }

  holderTimerState = {
    holdTimer: null,
    isHolding: false,
  }

  scrollIntervalState = {
    interval: null,
  }

  focusState = {
    focusElement: null,
    isDragging: false,
  }

  constructor(RowGap) {
    this.#storageManager = new StorageManager()
    this.listElement = RenderTasks.listElement
    this.listElements = this.listElement.children
    this.listRowGap = RowGap
    this.dragModeButton = document.getElementById(this.ids.dragModeButton)

    this.state = { ...this.initialState }

    this.bindEvents()
  }

  bindEvents() {
    this.listElement.addEventListener('pointerdown', (event) => { this.onPointerDown(event) })
    document.addEventListener('pointermove', (event) => { this.onPointerMove(event) })
    document.addEventListener('pointerup', () => { this.onPointerUp() })

    this.listElement.addEventListener('focusout', () => { this.resetFocusState() })
    this.listElement.addEventListener('keydown', (event) => { this.keydownHandler(event) })

    this.dragModeButton.addEventListener('click', () => { this.onDragModeButtonClick() })
  }

  resetDragMode() {
    this.isDraggingMode = false
    const dndButtons = document.querySelectorAll(this.selectors.dndButton)
    const checkboxElements = document.querySelectorAll(this.selectors.checkbox)

    dndButtons.forEach((button) => { button.classList.add('hidden') })
    checkboxElements.forEach((checkbox) => { checkbox.classList.remove('hidden'); checkbox.nextElementSibling.classList.remove('hidden') })
    this.dragModeButton.innerHTML = this.svg.onDndModeIcon
    this.dragModeButton.ariaLabel = 'Войти в режим редактирования'
    this.dragModeButton.title = 'Войти в режим редактирования'
  }

  onDragModeButtonClick() {
    const dndButtons = document.querySelectorAll(this.selectors.dndButton)
    const checkboxElements = document.querySelectorAll(this.selectors.checkbox)
    this.isDraggingMode = !this.isDraggingMode

    if (this.isDraggingMode) {
      dndButtons.forEach((button) => { button.classList.remove('hidden') })
      checkboxElements.forEach((checkbox) => { checkbox.classList.add('hidden'); checkbox.nextElementSibling.classList.add('hidden') })
      this.dragModeButton.innerHTML = this.svg.offDndModeIcon
      this.dragModeButton.ariaLabel = 'Выйти из режима редактирования'
      this.dragModeButton.title = 'Выйти из режима редактирования'
    } else {
      this.resetDragMode()
    }
  }

  resetFocusState() {
    if (this.focusState.isDragging && this.state.draggableElement) {
      this.state.draggableElementWrapper.style.height = ''
      this.state.draggableElement.style.zIndex = '0'
      this.state.draggableElement.classList.remove(this.stateClasses.isDragging)
    }

    this.state.draggableElement?.blur()
    this.focusState.focusElement = null
    this.focusState.isDragging = false
  }

  keydownHandler(event) {
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault()

      this.focusState.focusElement = event.target
      this.focusState.isDragging = true

      this.setDragState(event, false)
    }

    if (this.focusState.isDragging && event.code === 'ArrowUp') {
      event.preventDefault()

      const previousElement = this.state.draggableElementWrapper.previousElementSibling
      if (previousElement) {
        this.elementShiftUp(previousElement, true)
      }

      const dndButton = this.state.draggableElement.querySelector(this.selectors.dndButton)
      dndButton.focus()
      this.focusState.focusElement = dndButton
      this.focusState.isDragging = true

      this.setDragState(event, false)
    }
    if (this.focusState.isDragging && event.code === 'ArrowDown') {
      event.preventDefault()

      const nextElement = this.state.draggableElementWrapper.nextElementSibling
      if (nextElement) {
        this.elementShiftDown(nextElement, true)
      }

      const dndButton = this.state.draggableElement.querySelector(this.selectors.dndButton)
      dndButton.focus()
      this.focusState.focusElement = dndButton
      this.focusState.isDragging = true

      this.setDragState(event, false)
    }

    if (this.focusState.isDragging && event.code === 'Escape') {
      this.resetFocusState()
      RenderTasks.tasks = this.getNewTasksList()
      this.#storageManager.saveTasksToLocalStorage(RenderTasks.tasks)
    }
  }

  getNewTasksList() {
    const newTasks = []

    for (let i = 0; i < RenderTasks.listElement.children.length; i++) {
      const taskElement = RenderTasks.listElement.children[i]
      const task = RenderTasks.tasks.find((task) => String(task.id) === String(taskElement.dataset.id))
      
      if (!task) continue
      
      const newTask = new Task(task.title, task.description, task.id, task.isComplete)

      newTasks.push(newTask)
    }

    return newTasks
  }

  elementShiftUp(previousElement, isKeyboardControl = false) {
    const children = Array.from(RenderTasks.listElement.children)
    const previousElementIndex  = children.indexOf(previousElement)

    if (previousElementIndex === -1) return
    
    for (let i = previousElementIndex; i !== -1; i--) {
      if (!children[i].matches('.hidden')) {
        const previousRect = children[i].getBoundingClientRect()
        const draggableRect = this.state.draggableElement.getBoundingClientRect()
        if (isKeyboardControl || draggableRect.top < previousRect.top + previousRect.height / 2 * 0.3) {
          RenderTasks.listElement.insertBefore(this.state.draggableElementWrapper, children[i])
          return
        }
      }
    }
  }

  elementShiftDown(nextElement, isKeyboardControl = false) {
    const children = Array.from(RenderTasks.listElement.children)
    const nextElementIndex  = children.indexOf(nextElement)

    if (nextElementIndex === -1) return
    
    for (let i = nextElementIndex; i !== children.length; i++) {
      if (!children[i].matches('.hidden')) {
        const nextRect = children[i].getBoundingClientRect()
        const draggableRect = this.state.draggableElement.getBoundingClientRect()
        if (isKeyboardControl || draggableRect.bottom > nextRect.top + nextRect.height / 2 * 1.7) {
          RenderTasks.listElement.insertBefore(this.state.draggableElementWrapper, children[i + 1])
          return
        }
      }
    }
  }

  onPointerDown(event) {
    if (this.focusState.focusElement) {
      this.resetFocusState()
      return
    }
    this.holderTimerState.holdTimer = setTimeout(() => {
      this.holderTimerState.isHolding = true
      this.setDragState(event)
    }, 300)
  }

  onPointerMove(event) {
    if (!this.state.draggableElement) return
    const listMaxY = this.listElement.getBoundingClientRect().height - this.state.draggableElement.getBoundingClientRect().height

    const listCurrentStartY = this.listElement.getBoundingClientRect().top
    const y = event.clientY - listCurrentStartY - this.state.offsetY

    if (event.pageY - this.state.offsetY > listCurrentStartY && y < listMaxY) {
      this.state.draggableElement.style.top = `${y}px`
    }

    const previousElement = this.state.draggableElementWrapper.previousElementSibling
    if (previousElement) {
      this.elementShiftUp(previousElement)
    }

    const nextElement = this.state.draggableElementWrapper.nextElementSibling
    if (nextElement) {
      this.elementShiftDown(nextElement)
    }

    if (!this.focusState.isDragging) {
      const viewportHeight = document.documentElement.clientHeight
      const scrollZone = 70
      const scrollSpeed = 180

      clearInterval(this.scrollIntervalState.interval)

      if (event.clientY < scrollZone) {
        this.scrollIntervalState.interval = setInterval(() => { this.autoScroll(-scrollSpeed) }, 10)
      } else if (event.clientY > viewportHeight - scrollZone) {
        this.scrollIntervalState.interval = setInterval(() => { this.autoScroll(scrollSpeed) }, 10)
      }
    }
  }

  onPointerUp() {
    clearTimeout(this.holderTimerState.holdTimer)
    this.holderTimerState.isHolding = false

    clearInterval(this.scrollIntervalState.interval)
    if (!this.state.draggableElement) return

    RenderTasks.tasks = this.getNewTasksList()
    this.#storageManager.saveTasksToLocalStorage(RenderTasks.tasks)

    this.resetState()
  }

  resetState() {
    this.state.draggableElementWrapper.style.height = ''
    this.state.draggableElement.style.zIndex = '0'
    this.state.draggableElement.classList.remove(this.stateClasses.isDragging)
    this.state.draggableElement.style.position = ''

    this.state = { ...this.initialState }
  }

  autoScroll(scrollSpeed) {
    scrollBy({
      left: 0,
      top: scrollSpeed,
      behavior: 'smooth',
    })
  }

  setDragState(event, setAbsolute = true) {
    if (this.holderTimerState.isHolding || this.focusState.isDragging) {
      const { target, clientY } = event
      const { top } = target.parentElement.getBoundingClientRect()

      if (!target.matches(this.selectors.dndButton)) return

      this.state.draggableElementWrapper = target.parentElement.parentElement
      this.state.draggableElement = target.parentElement
      this.state.offsetY = clientY - top
      this.state.draggableElement.style.zIndex = 100
      this.state.draggableElement.classList.add(this.stateClasses.isDragging)
      if (setAbsolute) {
        this.state.draggableElement.style.position = 'absolute'
      }

      this.state.draggableElementWrapper.style.height = `${this.state.draggableElement.getBoundingClientRect().height}px`
      this.state.draggableElement.style.top = `${this.getNewTopCoordinate(this.state.draggableElementWrapper)}px`
    }
  }

  getNewTopCoordinate(element) {
    let topY = 0

    const listLength = [...this.listElements].length
    for (let i = 0; i < listLength; i++) {
      const item = this.listElements[i]
      if (item === element) return topY

      topY += item.getBoundingClientRect().height + this.listRowGap
    }
    return topY
  }
}