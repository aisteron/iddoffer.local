// dropdown menu aside
import { qs,qsa } from "../../libs";

export function aside(){
	if(!qs('aside ul')) return
	let lis = qsa(":scope > li",qs('aside ul'))
	
	lis.forEach(li => {
		li.addEventListener("click", event =>{
			event.target.classList.toggle("open")
		})
	})
}