import { prepare_products } from "."
import { qs } from "../../libs"

import { store } from "./store"

export async function Pagination(){

	// пагинация - всегда следствие кол-ва продуктов
	// не нужно хранить кол-во продуктов в стейте
	// нужно в draw() пагинации это кол-во передавать

	let res = await prepare_products(store.getState())
	draw(res.length)
	//draw()
}



function draw(len){
	// получает кол-во товаров
	let perpage = store.getState().pagination.perpage
	let curpage = store.getState().pagination.page
	let str = ``
	let c = Math.ceil(len/perpage)
	if(c == 1){
		str = ''
		return
	}

	//if(c >= 3) // добавить кнопку вправо


}