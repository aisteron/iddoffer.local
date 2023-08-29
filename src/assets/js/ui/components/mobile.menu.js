import { qs } from "../../libs"
export function mobile_menu(){
	open()
}

function open(){
	qs("#nav-icon1").addEventListener("click", event => {
		event.target.classList.toggle("open")
		qs('#mobile_menu').classList.toggle("open")
	})

	document.addEventListener("click", event => {
		if(event.target == qs("#nav-icon1")) return
		if(qs('#mobile_menu').contains(event.target)) return
		qs('#mobile_menu').classList.remove("open")
		qs("#nav-icon1").classList.remove('open')
	})
}