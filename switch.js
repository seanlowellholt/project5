let selectCheckbox = document.querySelectorAll('.hide')

console.log(selectCheckbox)

selectCheckbox.forEach(item => {
  item.addEventListener('change', event => {
  console.log('testing')
  console.log(event.target.checked)
  })
})