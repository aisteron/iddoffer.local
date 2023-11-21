import { load_tippy, xml,qs, qsa, cfg, load_toast } from "../../libs"
import { store, add, recount, thunkFunction, textarea, remove, clean } from "./store"
import { dx } from '../../ui/filter/dexie';
import { replace_currency } from "../../ui/components/desktop.menu";

export async function Cart(){
	
	if(!qs('.cart-page')) return

	let res = await cart.get_order()
	if(!res.length) return if_empty_order()
	await load_tippy()
	
	!await cart.validate_mods(res) && await cart.update_mods(res)


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
		cart.listener_material()
		cart.listener_textarea()
		cart.listener_remove()

	})

	store.dispatch(add(res))	
	cart.fields()
	replace_currency()

	
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
				
				if(res.success){

					const instance = tippy(event.target,{
						content: `Товар в вашем заказе`,
						placement: "bottom",
						animation: 'fade',
					});
			
				
					instance.show();
					event.target.classList.add('incart')
					event.target.nodeName == 'BUTTON'
					&& (event.target.innerHTML = 'В вашем заказе')

					cart.draw_cart_count()
				} else {
					await load_toast()
					new Snackbar(res.message)
				}
				
				
				
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
		: await xml('get_order',null,'/api/cart').then(r => JSON.parse(r))

		
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
			let user_discount = localStorage.getItem("discount")
			prods.forEach(prod => {
				let final_discount = (prod.discount - user_discount) > 0 ? prod.discount : user_discount
				let price = final_discount ? ((100-final_discount) / 100 * prod.price).toFixed(2) : prod.price
				str += `
					<div class="item" key="${prod.key}" data-id="${prod.id}">
						
						<ul class="left">
							<li class="name">Наименование</li>
							<li class="price">Цена, <span class="cur">р.</span></li>
							<li class="prod_discount">Скидка продукта</li>
							<li class="user_discount">Скидка пользователя</li>
							<li class="final_discount">Скидка итоговая</li>
							<li class="count">Количество</li>
							<li class="itog">Итого, <span class="cur">р.</span></li>
						</ul>

						<ul class="right">
							<li class="name"><a href="${cfg.host}/${prod.uri}">${prod.name}</a></li>
							<li class="price" byn="${prod.price}">${price}</li>
							<li class="prod_discount">${prod.discount} %</li>
							<li class="user_discount">${user_discount ? user_discount : "-"} %</li>
							<li class="final_discount">${final_discount ? final_discount : "-"} %</li>
							<li class="count">

								<div class="wrap">
									<img class="down" src="/assets/img/icons/minus.svg" width="23" heigth="23">
									<input type="number" value="${prod.count}">
									<img class="up" src="/assets/img/icons/plus.svg" width="23" heigth="23">
								</div>
								<img class="remove" src="/assets/img/icons/trash.svg" width="18" height="17">

							</li>
							<li class="itog" byn="${prod.price * prod.count}">${price * prod.count}</li>
							<li>
								<ul class="stats">
									
									<li class="colors"> <span class="name">Цвета:</span> </li>
									
									<li class="material"> <span class="name">Материал фасада:</span> </li>

									<li class="comment ${prod.txt ? `open`:''}" >

										<span class="name">Комментарий:</span>
										<button>
											<img src="/assets/img/icons/write.svg" width="15" height="15">
											<span>Написать</span>
										</button>

										<textarea>${prod.txt ? prod.txt : ""}</textarea>
									</li>
								</ul>
							</li>
						</ul>
					</div>
				`
			})
			mob.innerHTML = str
		}
		if(dsk){
			prods.forEach(prod => {
				str +=`
				<tr data-id="${prod.id}">
					<td class="name"><a href="${prod.uri}">${prod.name}</a>
						<ul class="stats">
							<li class="colors">
								<span class="name">Цвет:</span>
								<div class="list"></div>
							</li>
							<li class="material">
								<span class="name">Материал:</span>
								
							</li>
							<li class="comment ${prod.txt ? `open`: ''}">
							<span class="name">Комментарий:</span>
							<span class="st">
								<img src="/assets/img/icons/write.svg" width="15" height="15">
								<span>Написать</span>
							</span>
							<textarea>${prod.txt ? prod.txt : ''}</textarea>
							</li>
						</ul>
					</td>
					<td class="price" byn="${prod.price}">${prod.price}</td>
					<td class="disc">0%</td>
					<td class="count">
						<input type="number" min="1" value="${prod.count}">
						<div class="arrows">
							<img class="up" src="/assets/img/icons/up.svg" width="11" height="6">
							<img class="down" src="/assets/img/icons/up.svg" width="11" height="6">
						</div>
					</td>
					<td class="itog" byn="${prod.price * prod.count}">${prod.price * prod.count}</td>
					<td class="remove">
						<img class="remove" src="/assets/img/icons/cclose.svg" width="24" height="24">
					</td>
				</tr>
				`
			})
			qs('tbody', dsk).innerHTML = str
		}

		let itog = prods.reduce((acc, cur) => acc += cur.price * cur.count,0)

		qs('.itogo [byn]').innerHTML = itog
		qs('.itogo [byn]').setAttribute('byn', itog)

		qs('button.continue').classList.add('open')
		qs('.root .table .mobile')?.classList.remove('loading')

		replace_currency()

	},
	async colors(res){
		let db = dx.init()
		let ids = res.map(el => el.id)
		let dsk = qs('.root .table .desktop')
		let mob = qs('.root .table .mobile')
		
		// colors
		for(let [i,id] of ids.entries()){
			
			let str = ``
			let res = await db.mod.where('ids').anyOf(id).toArray()
			if(!res.length){console.log('Не могу найти модификацию'); return}

			res[0].prods.map(el => [el.color,el.id]).forEach(c => {
				let color = COLORS.filter(co => co.name == c[0])
				if(!color.length){console.log('Не могу найти цвет среди COLORS'); return}
				color = color[0]
				
				str += `
					<${mob ? `li` : `span`}
						${c[1] == id ? `class="active"`:""}
						${color.code ? `style='background-color: ${color.code} ${color.code == "#fff" ? '; border-color: #ccc\'': "'"}`: ""}
						${color.image ? `style="background-image: url(${cfg.host}/${color.image})"`: ""}
						data-prodid="${c[1]}"
						title="${color.name}"
					></${mob ? `li` : `span`}>`


			})
			
			if(qsa(`[data-id="${id}"]`).length > 1){
				// когда в списке продуктов оказываются 2 одинаковых из-за модификации
				mob
				? qsa(`[data-id="${id}"] .stats .colors .name`)[i].insertAdjacentHTML('afterend', `<ul>`+str+`</ul>`)
				: qsa(`[data-id="${id}"] .colors .list`)[i].innerHTML = str
			} else {
				mob
				? qs(`[data-id="${id}"] .stats .colors .name`).insertAdjacentHTML('afterend', `<ul>`+str+`</ul>`)
				: qs(`[data-id="${id}"] .colors .list`).innerHTML = str

			}
		}

		// material facade

		for(let [i,id] of ids.entries()){
			let str = ``
			let res = await db.mod.where('ids').anyOf(id).toArray()
			let selected = res[0].prods.filter(el => el.id == id)[0].material_facade.join()
			str += `<span class="selected">${selected}</span><ul>`
			res[0].prods.map(el => [el.material_facade.join(), el.id]).forEach(el => str += `<li data-prodid="${el[1]}">${el[0]}</li>`)

			if(qsa(`[data-id="${id}"]`).length > 1){
				qsa(`[data-id="${id}"] .stats .material .name`)[i].insertAdjacentHTML('afterend', str+'</ul>')
			} else {

				qs(`[data-id="${id}"] .stats .material .name`).insertAdjacentHTML('afterend', str+'</ul>')
			}
			
		}
	},

	async draw_cart_count(){
		let count = +await xml('get_order_count', null,'/api/cart')
		let cart_a = qs('.header .actions a.cart')
		
		if(!count){
			if(qs('.circle', cart_a)){
				qs('.circle', cart_a).remove()
			}
		} else {
			if(qs('.circle', cart_a)){
				if(qs('.circle', cart_a)){
					qs('.circle', cart_a).innerHTML = count
				} else {
					let str = ` <span class="circle">${count}</span> `
					cart_a.insertAdjacentHTML("beforeend", str)
				}
			}
		}
	},

	listener_recount(){
		let dsk = qs('.root .table .desktop')
		let mob = qs('.root .table .mobile')

		let arrows = qsa('.root .table img.up, .root .table img.down')
		
		arrows.forEach(img => {
			img.addEventListener("click", event => {
				let input,value;
				let resid = +event.target.closest('[data-id]').dataset.id
				let key = store.getState().prods.filter(el => el.id == resid)[0].key
				
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
				? value = +input.value - 1
				: value = +input.value + 1

				store.dispatch(recount({id: resid, count: value}))
				xml('recount_prod',{key, value}, '/api/cart')



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
				let replaceid = +event.target.dataset.prodid
				let id = +event.target.closest('[data-id]').dataset.id
				if(id == replaceid){console.log('Тот же продукт'); return}
				
				store.dispatch(thunkFunction({id, replaceid}))
				// redux thunk
			})
		})
	},
	listener_material(){
		// open
		qsa('.material .selected').forEach(el => {
			el.addEventListener("click", event => {
				event.target.closest('.material').classList.toggle('open')
			})
		})
		

		qsa('.material [data-prodid]').forEach(li => {
			li.addEventListener("click", event => {
				let replaceid = +event.target.dataset.prodid
				let id = +event.target.closest('[data-id]').dataset.id
				if(id == replaceid){
					console.log('Тот же продукт');
					tippy(event.target,{content: 'Та же модификация'}).show() 
					return}
				
				store.dispatch(thunkFunction({id, replaceid}))

			})
		})
	},
	listener_textarea(){
		let mob = qs('.root .table .mobile')

		// open mobile
		qsa('.item .comment button').forEach(el => {
			el.addEventListener('click', event => {
				event.target.closest('.comment').classList.toggle('open')
			})
		})

		// open desktop
		
		qsa('tr[data-id] .st').forEach(el => {
			el.addEventListener('click', event => {
				event.target.closest('.comment').classList.toggle('open')
			})
		})

		qsa(`${mob ? `.item`: `tr[data-id]`} .comment textarea`).forEach(t => {
			t.addEventListener('blur', event => {
				let id = event.target.closest('[data-id]').dataset.id
				let value = event.target.value.replace('\t\n\r','').trim();
				store.dispatch(textarea({id, value}))
			})
		})

	},
	listener_remove(){
		let mob = qs('.root .table .mobile')

		qsa(`${mob ? `.item`: `tr[data-id]`} img.remove`).forEach(el => {
			el.addEventListener('click', event => {
				let id = +event.target.closest('[data-id]').dataset.id
				let key = store.getState().prods.filter(el => el.id == id)[0].key
				xml('remove_prod',{k: key}, '/api/cart')
				store.dispatch(remove(id))
				this.draw_cart_count()
			})
		})
	},
	fields(){
		// open
		qs('button.continue').addEventListener('click', _ =>
			qs('.root .fields').classList.add('open'))
		
		qs('.root .fields form').addEventListener('submit', event =>{
			event.preventDefault();
			let user = {
				name: qs('input[name="name"]').value,
				email: qs('input[name="email"]').value,
				phone: qs('input[name="phone"]').value,
				comment: qs('form textarea').value,

			}

			xml('order_receive',{user, prods: store.getState().prods}, '/api/cart')
			.then(r => JSON.parse(r))
			.then(r => {
				if(r.success){
					load_toast()
					.then(_ => {
						new Snackbar('Успешно отправлено');
						store.dispatch(clean())
					})
					
				} else {
					load_toast()
					.then(_ => new Snackbar(r.message +" "+r.data.join()))
					r.data.forEach(el => {
						el == 'receiver' && (el = 'name')
						qs(`.fields input[name='${el}']`).classList.add('error')
						
						setTimeout(()=>{
							qs(`.fields input[name='${el}']`).classList.remove('error')
						},2000)
					})
				}
			})
			
		})



	}
	
}

function if_empty_order(){
	qs('h1').innerHTML = 'Ваш заказ пуст';
	qs('.itogo').remove()
	qs('button.continue').remove()
	qs('.root .mobile')
		? qs('.root .mobile').remove()
		: qs('.root .desktop').remove()
	qs('nav.bread').remove()
	qs('.root .fields').remove()
	
	return false;
}