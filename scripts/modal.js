export default class Modal {
  selectors = {
    modal: '[data-js-modal]',
    modalError: '[data-js-modal-error]',
    modalTitle: '[data-js-modal-title]',
  }

  ids = {
    closeModalBtn: 'closeModal',
    modalInput: 'modalInput',
    modalDescriptionInput: 'modalDescriptionInput'
  }
  
  html = document.querySelector('html')
  constructor() {
    this.modalElement = document.querySelector(this.selectors.modal)
    this.errorMessageElement = document.querySelector(this.selectors.modalError)
    this.closeModalButton = document.getElementById(this.ids.closeModalBtn)
    this.modalTitleInput = document.getElementById(this.ids.modalInput)
    this.modalDescriptionInput = document.getElementById(this.ids.modalDescriptionInput)
    this.modalTitle = document.querySelector(this.selectors.modalTitle)
  }

  openModal() {
    this.modalElement.showModal()
    this.html.classList.add('lock')
  }
  
  closeModal() {
    this.modalTitle.textContent = 'Новая задача'
    this.errorMessageElement.textContent = ''
    this.modalTitleInput.value = ''
    this.modalDescriptionInput.value = ''
  
    this.modalElement.close()
    this.html.classList.remove('lock')
  }

  showError(error) {
    this.errorMessageElement.textContent = error
  }
}