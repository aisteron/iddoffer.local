import {load_toast, qs, qsa, xml} from '../../libs';
import { dx } from './dexie';
import { store,incremented, decremented, ls } from './store';

export async function Filter(){
	accordeon()
	
	await dx.load()
	dx.init()
	let hash = await get_hash();

	valid(hash) ? draw() : update()

	

	store.subscribe(() => console.log(store.getState()))
	store.dispatch(incremented())
	store.dispatch(incremented())
	store.dispatch(decremented())

		
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

async function get_hash(){
	
	if(!qs('.subcat-page')) return
	

	let resid = +qs("body").getAttribute("resid")
	
	if(!resid){
		load_toast().then(_ => new Snackbar("prodid is invalid"));
		return;
	}

	return await xml("get_hash",{id: resid},'/api/')

}

function valid(hash){
	return ls.get() ? true : false
}
function draw(){}

async function update(){
	let resid = +qs("body").getAttribute("resid")
	await get_filters(resid)
}

async function get_filters(){
	//xml('get_filters',null,'/api/')
}


// redux разобраться
// стейт для фильтра и продуктов