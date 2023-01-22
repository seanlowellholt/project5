function createOptionsList(response) {
	document.querySelector('.select__host').innerHTML = response.map(host => {
    return `<option value="${host}">${host}</option>`
  })

}
   