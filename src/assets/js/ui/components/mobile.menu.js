import { qs } from "../../libs"
import { dx } from "../filter/dexie"
export function mobile_menu(){
	open()
	clean_dexie()
	
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

function clean_dexie(){
	let remove = qs('#mobile_menu .remove')
	if(!remove) return

	remove.addEventListener("click", async event => {
		await dx.load()
		//await dx.init()
		await dx.clean()
		remove.style.visibility = 'hidden'
	})

}