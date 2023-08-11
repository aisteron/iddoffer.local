import { qs,qsa } from "../../libs";
import { store,sort } from "./store";

export function Sort(){
	if(!qs('#pagination .sort')) return

	open()

	qsa('#pagination .sort ul li').forEach(li =>{
		li.addEventListener("click", event =>{
			let dir = event.target.classList[0] == 'default' ? null : event.target.classList[0]
			let sorted = store.getState().sort
			if(dir == sorted) return
			store.dispatch(sort(dir))
		})
	})

	store.subscribe(_ => {
		let state = store.getState()
		let dir = ''
		switch(state.sort){
			case null:
				dir = 'Сортировать'
				break;
			case 'asc':
				dir = 'Сначала дороже'
				break;	
			case 'desc':
				dir = 'Сначала дешевле'
				break;	
		}
		qs('#pagination .sort.dd span').innerHTML = dir
		qs('#pagination .sort.dd ').classList.remove('open')
	})
}

function open(){
	
	qs('#pagination .sort.dd span').addEventListener("click", event =>{
		event.target.parentElement.classList.toggle('open')
	})

	document.addEventListener("click", event => {
		if(event.target == qs('#pagination .sort.dd span')) return
		if(qs('#pagination .sort.dd').contains(event.target)) return
		qs('#pagination .sort.dd').classList.remove('open')
	})
}