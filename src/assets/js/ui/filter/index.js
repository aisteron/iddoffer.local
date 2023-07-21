import {qs, qsa} from '../../libs';

export function Filter(){
	accordeon()
	get_filter_config()
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

function get_filter_config(){}

// redux разобраться
// стейт для фильтра и продуктов