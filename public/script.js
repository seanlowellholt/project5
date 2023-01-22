
import Select from './custom-select.js'

const selectElements = document.querySelectorAll('.select__host')

selectElements.forEach((selectElement) => {
    console.log(selectElement)
    new Select(selectElement)
})