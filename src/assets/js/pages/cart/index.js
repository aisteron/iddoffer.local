import { load_tippy, xml,qs, qsa, cfg, debounce } from "../../libs"
import { store, add, recount, replace } from "./store"
import { dx } from '../../ui/filter/dexie';

export async function Cart(){
	
	if(!qs('.cart-page')) return

	let res = await cart.get_order()
	if(!res.length) return if_empty_order()
	await load_tippy()
	
	!await cart.validate_mods(res) && cart.update_mods(res)


	store.subscribe(async _ => {
		let state = store.getState()
		console.log(state)
		
		if(!state.prods.length){
			if_empty_order()
			console.log('prods is empty')
			return
		}
			cart.draw(state.prods)
			await cart.colors(state.prods)
			
			cart.listener_recount()
			cart.listener_input()
			cart.listener_color()

	}
	)
	store.dispatch(add(res))
}

export const cart = {
	async add(els){
		
		await load_tippy()
		
		els.forEach(el => {
			el.addEventListener("click", async (event) => {
				let prodid = undefined
				
				event.target.nodeName == 'IMG' // subcat page
				&& (prodid = +event.target.closest('[data-prodid]').dataset.prodid)

				event.target.nodeName == 'BUTTON' // prod page
				&& (prodid = +qs('[resid]').getAttribute('resid'))

				let res = await xml('add_to_cart', {id: prodid}, '/api/cart')
				res = JSON.parse(res)
				
				const instance = tippy(event.target,{
					content: `Товар в корзине`,
					placement: "bottom",
					animation: 'fade',
			 	});
		 
			 
				instance.show();
				event.target.classList.add('incart')
				event.target.nodeName == 'BUTTON'
				&& (event.target.innerHTML = 'В корзине')
				
				//setTimeout(()=>{instance.destroy()},2000)

			})
		})
	},

	async get_order(){ 

		return process.env.NODE_ENV == 'development'
		? fetch('/api/cart',{
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: '{"action":"get_order"}'
		}).then(r => r.json())
		: await xml('get_order',null,'/api/cart')

		
	},
	async validate_mods(prods){
		
		await dx.load()
		
		let db = dx.init()
		let ids = prods.map(el => el.id)
		let valid = true
		
		for(const id of ids){
			let res = await db.mod.where('ids').anyOf(id).toArray()
			if(!res.length) {valid = false; break;}
		}
		return valid
	},
	async update_mods(prods){
		let db = dx.init()
		let ids = prods.map(el => el.id)
		for(const id of ids){
			let resp = await xml('get_modifications', {id: id}, '/api/').then(r => JSON.parse(r))
			let r = await db.mod.where({article: resp.article}).toArray()
			
			if(!r.length){
				await db.mod.put(resp)
			} else {
				if(r[0].editedon !== resp.editedon){
					await db.mod.where({article: resp.article}).delete()
					await db.mod.put(resp)
				} else {
					console.log(`Модификации для prodid = ${id} актуальны`)
				}
			}
		}
	},
	draw(prods){
		let dsk = qs('.root .table .desktop')
		let mob = qs('.root .table .mobile')
		let str = ``
		
		if(mob){
			str += `<div class="mobile">`
			

			prods.forEach(prod => {
				str += `
					<div class="item" key="${prod.key}" data-id="${prod.id}">
						
						<ul class="left">
							<li class="name">Наименование</li>
							<li class="price">Цена, <span class="cur">р.</span></li>
							<li class="disc">Скидка</li>
							<li class="count">Количество</li>
							<li class="itog">Итого, <span class="cur">р.</span></li>
						</ul>

						<ul class="right">
							<li class="name"><a href="${cfg.host}/${prod.uri}">${prod.name}</a></li>
							<li class="price" byn="${prod.price}">${prod.price}</li>
							<li class="disc">0%</li>
							<li class="count">

								<div class="wrap">
									<img class="down" src="/assets/img/icons/minus.svg" width="23" heigth="23">
									<input type="number" value="${prod.count}">
									<img class="up" src="/assets/img/icons/plus.svg" width="23" heigth="23">
								</div>
								<img class="remove" src="/assets/img/icons/trash.svg" width="18" height="17">

							</li>
							<li class="itog" byn="${prod.price * prod.count}">${prod.price * prod.count}</li>
							<li>
								<ul class="stats">
									
									<li class="colors">
										<span class="name">Цвета:</span>

									</li>
									
									<li class="material">
										<span class="name">Материал фасада:</span>

									</li>

									<li class="comment">

										<span class="name">Комментарий:</span>
										<button>
											<img src="/assets/img/icons/write.svg" width="15" height="15">
											<span>Написать</span>
										</button>

										<textarea>
										</textarea>
									</li>
								</ul>
							</li>
						</ul>
					</div>
				`
			})

			str += `</div>`
			mob.innerHTML = str
		}

		let itog = prods.reduce((acc, cur) => acc += cur.price * cur.count,0)

		qs('.itogo [byn]').innerHTML = itog
		qs('.itogo [byn]').setAttribute('byn', itog)

		qs('button.continue').classList.add('open')
		qs('.root .table .mobile').classList.remove('loading')

	},
	async colors(res){
		let db = dx.init()
		let ids = res.map(el => el.id)
		
		// colors
		for(let id of ids){
			
			let str = ``
			let res = await db.mod.where('ids').anyOf(id).toArray()
			if(!res.length){console.log('Не могу найти модификацию'); return}

			res[0].prods.map(el => [el.color,el.id]).forEach(c => {
				let color = COLORS.filter(co => co.name == c[0])
				if(!color.length){console.log('Не могу найти цвет среди COLORS'); return}
				color = color[0]
				str += `
					<li
						${c[1] == id ? `class="active"`:""}
						${color.code ? `style='background-color: ${color.code} ${color.code == "#fff" ? '; border-color: #ccc\'': "'"}`: ""}
						${color.image ? `style="background-image: url(${cfg.host}/${color.image})"`: ""}
						data-prodid="${c[1]}"
						title="${color.name}"
					></li>`
			})
			qs(`[data-id="${id}"] .stats .colors .name`).insertAdjacentHTML('afterend', `<ul>`+str+`</ul>`)
		}

		// material facade

		for(let id of ids){
			let str = ``
			let res = await db.mod.where('ids').anyOf(id).toArray()
			let selected = res[0].prods.filter(el => el.id == id)[0].material_facade.join()
			str += `<span class="selected">${selected}</span><ul>`
			res[0].prods.map(el => [el.material_facade.join(), el.id]).forEach(el => str += `<li data-prodid="${el[1]}">${el[0]}</li>`)

			qs(`[data-id="${id}"] .stats .material .name`).insertAdjacentHTML('afterend', str+'</ul>')
			
		}
	},

	listener_recount(){
		let dsk = qs('.root .table .desktop')
		let mob = qs('.root .table .mobile')

		let arrows = qsa('.root .table img.up, .root .table img.down')
		
		arrows.forEach(img => {
			img.addEventListener("click", event => {
				let input = undefined
				let resid = +event.target.closest('[data-id]').dataset.id
				mob 
					? input = qs('input', event.target.closest('.wrap'))
					: input = qs('input', event.target.closest('.count'))
	
				
				if(
					event.target.classList[0] == 'down'
					&& input.value == 1){
					tippy(event.target,{ content: `Меньше 1 нельзя`}).show()
					return
				}

				event.target.classList[0] == 'down'
				? store.dispatch(recount({id: resid, count: +input.value - 1}))
				: store.dispatch(recount({id: resid, count: +input.value + 1}))


			})
		})
	
	},
	listener_input(){
		qsa('.root .table input[type="number"]').forEach(input => {
			input.addEventListener("keyup", event => {
				let id = +event.target.closest('[data-id]').dataset.id
				let count = +event.target.value
				
				if(count <= 0) return
				
				store.dispatch(recount({id, count }))
			})
		})

	},
	listener_color(){
		qsa('.colors [data-prodid]').forEach(li => {
			li.addEventListener("click", event => {
				let id = +event.target.dataset.prodid
				let replaceid = +event.target.closest('[data-id]').dataset.id
				store.dispatch(replace({id, replaceid}))
				// redux thunk
			})
		})
	}
	
}

function if_empty_order(){
	qs('h1').innerHTML = 'Ваша корзина пуста';
	qs('.itogo').remove()
	qs('button.continue').remove()
	return false;
}