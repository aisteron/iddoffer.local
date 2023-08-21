import { qs } from "../../libs";

export function desktop_menu(){
	if(!qs('nav.header li.dd')) return
	
	qs('nav.header li.dd span').addEventListener("click", event => {
		event.target.closest('li').classList.toggle('open')
	})

	document.addEventListener("click", event => {
		if(event.target == qs('nav.header li.dd span')) return
		if(qs('nav.header li.dd').contains(event.target)) return
		qs('nav.header li.dd').classList.remove('open')
	})
}