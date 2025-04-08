export default class Modal {
  selectors = {
    modal: '[data-js-modal]',
    modalError: '[data-js-modal-error]',
  }

  ids = {
    closeModalBtn: 'closeModal',
  }
  
  html = document.querySelector('html')
  constructor() {
    this.modalElement = document.querySelector(this.selectors.modal)
    this.errorMessageElement = document.querySelector(this.selectors.modalError)
    this.closeModalButton = document.getElementById(this.ids.closeModalBtn)
  }

  openModal() {
    this.modalElement.showModal()
    this.html.classList.add('lock')
  }
  
  closeModal() {
    this.errorMessageElement.textContent = ''
  
    this.modalElement.close()
    this.html.classList.remove('lock')
  }

  showError(error) {
    this.errorMessageElement.textContent = error
  }
}