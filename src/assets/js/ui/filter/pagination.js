import { prepare_products } from "."
import { qs, qsa } from "../../libs"

import { store,paginate } from "./store"

export async function Pagination(){

	// пагинация - всегда следствие кол-ва продуктов
	// не нужно хранить кол-во продуктов в стейте
	// нужно в draw() пагинации это кол-во передавать

	let res = await prepare_products(store.getState())
	res = prepare_pagination(res.length) // вернет {curpage, [1,2,3,>]}
	draw_pagination(res)
	listeners()
}



export function prepare_pagination(len){
	// получает кол-во товаров
	// где-то надо сбросить pagination.page при фильтрации товаров

	let perpage = store.getState().pagination.perpage
	let curpage = store.getState().pagination.page
	let arr = []
	let pages = Math.ceil(len/perpage)
	//pages = 4
	//curpage = 1
	
	if(pages == 1){
		arr.push(1)
		return {curpage, arr}
		}
	


	console.log('pages:', pages)
	console.log('current:', curpage)


	// [1,_,_]
	if(((curpage + 2) % 3 == 0)){


		if(pages <=3 || (curpage !== pages)){	
			arr.push(curpage); // [1]
			(curpage + 1) <= pages && arr.push(curpage+1); // [1,2]
			(curpage + 2) <= pages && arr.push(curpage+2); // [1,2,3]
		}

		if(curpage == pages){
			arr.push(curpage-2)
			arr.push(curpage-1)
			arr.push(curpage)
		}
		
		


	}

	// [_,2_]

	if((curpage + 1) % 3 == 0){
		
		arr.push(curpage-1); // [1]
		arr.push(curpage); // [1,2]
		
		(curpage + 1) <= pages && arr.push(curpage+1); // [1,2,3]
	}

	// [_,_,3]

	if(curpage % 3 == 0 ){
		arr.push(curpage-2); // [1]
		arr.push(curpage-1); // [1,2]
		(curpage) <= pages && arr.push(curpage); // [1,2,3]
	}


	if(pages > 3){
		if(curpage !== pages){
			if(
				((curpage + 1) !== pages)
				//&& ((curpage + 2) !== pages)){
			){
				arr.push('>')
			}
		}
	}

	return {curpage, arr}

}

export function draw_pagination({curpage,arr}){

	let str = ``
	qs('#pagination ul.pages').classList.remove('loading')

	arr.forEach(el => {
		str += `<li ${el == curpage ? `class="active"`: ''}
								${el == ">" ? `class="next"`: ''}
								>
							<a href="#">
								${el == ">" ? `<img src="/assets/img/icons/c612.svg"/>` : el}
							</a>
						</li>`
	})
	qs('#pagination ul.pages').innerHTML = str
	
}

export function listeners(){

	if(!qs('#pagination ul.pages li')) return

	qsa('#pagination ul.pages li a').forEach(el => {
		el.addEventListener("click", event => {
			event.preventDefault()
			let state = store.getState()
			let current = state.pagination.page
			
			if(event.target.closest('li').classList.contains('next')){
				store.dispatch(paginate(current+1))
				return
			}

			let p = event.target.innerHTML
			p = +p.replace(/[\r\n\t]/gm, '')

			if(p == current) return
			store.dispatch(paginate(p))
		})
	})
}