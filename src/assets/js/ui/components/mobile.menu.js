import { qs } from "../../libs"
export function mobile_menu(){
	open()
}

function open(){
	qs("#nav-icon1").addEventListener("click", event => {
		event.target.classList.toggle("open")
	})
}