import { qs } from "../../libs"

export function sort(){
	open()
}

function open(){
	if(!qs("#pagination .sort")){
		console.log("%c can not add listener for sort", "color: #666")
		return
	}
	qs("#pagination .sort").addEventListener("click", event => {
		event.target.classList.toggle("open")
	})
}