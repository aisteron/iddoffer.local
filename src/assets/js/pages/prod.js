import { qs, qsa } from "../libs"
export function prod(){
	if(!qs('.prod-page')) return
	
	tabs()
}

function tabs(){
	if(!qs("section.tabs")){console.log("%c tabs not found", "color: #666"); return}

	let head_tabs = qsa("section.tabs ul.head li")
	head_tabs.forEach(el => {
		el.addEventListener("click", event => {

			//underline
			head_tabs.forEach(el => el.classList.remove("active"))
			event.target.classList.add("active")



			let idx = event.target.dataset.index

			qsa(`.body [data-index]`).forEach(el => el.classList.remove("open"))

			qs(`.body [data-index="${idx}"]`).classList.add("open")
		})
	})
}