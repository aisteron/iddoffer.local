import {qs, qsa} from '../../libs';

export function Filter(){
	accordeon()
}

function accordeon(){
	if(!qs("#filter")){
		console.log("%c нет фильтра на странице","color: #666")
		return
	}
	qsa("#filter .item > span").forEach(span => {
		span.addEventListener("click", event => {
			event.target.closest(".item").classList.toggle("open")
		})
	})
}