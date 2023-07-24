import {load_toast, qs, qsa, xml} from '../../libs';
import { dx } from './dexie';
import { store,incremented, decremented } from './store';

export async function Filter(){
	accordeon()
	
	await dx.load()
	dx.init()
	let hash = await get_hash();
	valid(hash) ? draw() : update()

	
	// Can still subscribe to the store
	store.subscribe(() => console.log(store.getState()))

	// Still pass action objects to `dispatch`, but they're created for us
	store.dispatch(incremented())
	// {value: 1}
	store.dispatch(incremented())
	// {value: 2}
	store.dispatch(decremented())
	// {value: 1}
		
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

function valid(hash){}
function draw(){}
function update(){}




// redux разобраться
// стейт для фильтра и продуктов