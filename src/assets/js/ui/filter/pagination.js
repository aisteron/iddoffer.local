import { qs } from "../../libs"
import { dx } from "./dexie"
import { paginationStore, store, count } from "./store"

export async function Pagination(){

	paginationStore.subscribe(() =>{
		let state = paginationStore.getState()
		console.log(state)
	})

	await get_prods_count()
	draw()
}

async function get_prods_count(){
	let db = dx.init()

	let catids = [+qs('[resid]').getAttribute("resid")]
	if(qs('[children]')) catids = children.map(el => el.id)

	let c = await db.prod.where('catid').anyOf(catids).count()
	paginationStore.dispatch(count(c))
}

function draw(){
	console.log(9)	
}