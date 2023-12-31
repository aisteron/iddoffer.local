import { qs, qsa, debounce, cfg} from '../../libs';
import { dx } from './dexie';
import { store, checkbox,design,size } from './store';
import { Chips } from './chips';
import { Pagination, draw_pagination, prepare_pagination, listeners as lis } from './pagination';
import { Sort } from './sort';
import { cart } from '../../pages/cart';
import { replace_currency } from '../components/desktop.menu';

/*
	
	* есть страница категория категорий
	* ПРАВИЛО: такие страницы не должны содержать непосредственно товары
	* признак категории категорий - тег <script children> в <head>
	
	* есть страница НЕПОСРЕДСТВЕННО списка товаров

	* обе страницы содержат мета-тег editedon - где хранится дата редактирования страницы
	* если эта дата отличается от сохраненной в dexie table cat, то мы обновляем инфу
	* дергаем ф-цию get_products,
	* которая вернет массив категории(й) с editedon и список фильтров
	* и массив продуктов

	* если есть <script children> (страница категории категорий)
	* то мы сравниваем editedon CHILDREN с имеющимися
	* если отличается, то дергаем ту же функцию get_products
	* обновляем таблицу cat, а из таблицы prod удаляем все продукты
	* в таблицу prod загружаем свежие продукты

	* парсим строку фильтров и товары категории(й)
	* создаем объект filter со значениями основанными на значениях продуктов
	
	* функция draw() читает таблицу cat, поле filter по resource id
	* и рисует строку фильтров

	* осталось повесить слушатели и диспатчить в состояние объект фильтров
	* по которому будем выполнять фильтрацию dexie таблицы prod

*/


export async function Filter() {
	
	//if(!qs('.subcat-page')) return
	if(!qs('#prods')) return


	await dx.load()

	
	let ed = await dx.validate_editedon()

	!ed && await dx.update_editedon()


	if(qs('script[children]')){
		let resp = await dx.validate_children()
		resp.length && await dx.update_children(resp)
	}

	await dx.construct_filters()
	
	await draw()

	listeners()

	store.subscribe(() => {

		let state = store.getState()
		console.log(state)
		
		prepare_products(state).then(pr => draw_products(state,pr))
		

	})


	Chips()
	Pagination()
	Sort()
	
	// модификации товаров
	!await dx.validate_mods()
	&& await dx.construct_mods()

	// добавление цветов к уже выведенным
	// движком продуктам
	color_html_prods()

	// слушатель добавить в корзину
	cart.add(qsa("ul.prod-list li img.cart"))

	// open / close mobile
	open_close_mobile()



}

function accordeon() {
	if (!qs("#filter")) {
		console.log("%c нет фильтра на странице", "color: #666")
		return
	}
	qsa("#filter .item > span").forEach(span => {
		span.addEventListener("click", event => {
			event.target.closest(".item").classList.toggle("open")
		})
	})
}


async function draw() {

	qs("#filter").classList.remove("loading")

	let resid = +qs('[resid]').getAttribute("resid")
	let db = dx.init();
	let obj = await db.cat.where({ catid: resid }).toArray();
	let str = ``
	if(!obj[0].filter){
		console.log('Пустой объект фильтра')
		return
	}
	obj[0].filter.forEach(f => {
		
		switch(f.name){
			case 'color':
			case 'brand':
			case 'material_facade':
			case 'material_body':
			case 'material_upholstery':
				str += template_checkbox(f);
				break;
			case 'size':
				str += template_size(f);
				break;
			case 'design':
				str += template_design(f);
				break;
		}


	})

	qs("#filter").insertAdjacentHTML("beforeend", str)
	accordeon()

}

function template_checkbox(f){

	if(!f.data.length) return ''

	let str = ``

	str += `<div class="item dd" data-name="${f.name}">
			     <span>${f.label}</span><ul>`
						f.data.forEach(c => {
							str += `
									<li>
										<label>
											<input type="checkbox">
											<span class="mark"></span>
											<span class="name">${c}</span>
										</label>
									</li>`
						})
	str += `</ul></div>`
	
	return str

}

function template_size(f){
	let str = `
			<div class="item dd" data-name="size">
				<span>${dict['size']}</span>
				<div class="size">
					<span>Ширина, мм</span>
					<div class="row" data-name="width">
						<input type="number" min="${f.width[0]}" placeholder="${f.width[0]}" />
						<input type="number" max="${f.width[1]}" placeholder="${f.width[1]}" />
					</div>
				</div>	
				
				<div class="size">	
					<span>Длина, мм</span>
					<div class="row" data-name="length">
						<input type="number" min="${f.length[0]}" placeholder="${f.length[0]}" />
						<input type="number" max="${f.length[1]}" placeholder="${f.length[1]}" />
					</div>
				</div>
				
				<div class="size">	
					<span>Высота, мм</span>
					<div class="row" data-name="height">
						<input type="number" min="${f.height[0]}" placeholder="${f.height[0]}" />
						<input type="number" max="${f.height[1]}" placeholder="${f.height[1]}" />
					</div>
				</div>
			</div>`

	return str;
	
}

function template_design(f){
	return `
		<div class="item design">
			<label>
				<input type="checkbox" />
				<span class="mark"></span>
				<span class="name">${dict['design']}</span>
			</label>
		</div>
	`

}

function listeners() {

	
	// checkboxes
	
	Array.from(qsa('#filter .item.dd')).forEach(el => {


		qsa('input[type="checkbox"]',el).forEach(input => {
			
			input.addEventListener("change", event =>{
				let res = Array.from(qsa('input',el)).filter(el => el.checked)
				let obj = {
					name: event.target.closest('[data-name]').dataset.name,
					data: res.map(el => qs('.name', el.closest('label')).innerText )
				}

				store.dispatch(checkbox(obj))
			})
		})

	})
	

	// is designed
	if(qs('.item.design input')){
		qs('.item.design input').addEventListener("change", event => store.dispatch(design(event.target.checked)))
	}
	

	// size
	if(qs('[data-name="size"]')){
		
		function collect(event){

			let row = event.target.closest('.row')
			let res = Array.from(qsa('input',row)).map(el => +el.value == 0 ? null : +el.value)
			
			
			let obj = {
				name: row.dataset.name,
				data: (res[0] == null && res[1] == null) ? [] : res
			}
			store.dispatch(size(obj))
		}

		let deb = debounce(collect, 500)
		qsa('[data-name="size"] input').forEach(el =>{
			//["keyup", "blur"].forEach(e => {
			["keyup"].forEach(e => {
				el.addEventListener(e, event => event.type == 'keyup' ? deb(event) : collect(event))
			})
		})
	}

}

export async function prepare_products(state){
	

	let db = dx.init()
	let prods = [];
	let ids = [];
	
	qs('[children]')
		? (ids = children.map(el => el.id))
		: ids = [+qs('[resid]').getAttribute('resid')]


	prods = await db.prod.where('catid').anyOf(ids).toArray()
	console.log('all prods: ',prods)

	if(!prods.length){console.log('%c продукты не найдены','color: red'); return []}



	for(const f of state.filters){
		

		switch(f.name){
			case 'color':
			case 'brand':
				prods = prods.filter(el => f.data.includes(el[f.name]));
				break;
			case 'material_facade': 
			case 'material_body': 
			case 'material_upholstery': 
				prods = prods.filter(prod => prod[f.name].filter(p => f.data.includes(p)).length ? true : false)
				break;
			case 'design':
				prods = prods.filter(el => el.is_designed == f.data)
				break;
			case 'size':
				f.data.forEach(el => {
					
					prods = prods.filter(e => {
						
						if(el.data[0] == null){
							return e[el.name] <= el.data[1]
						}

						if(el.data[1] == null){
							return e[el.name] >= el.data[0]
						}

						return e[el.name] >= el.data[0] && e[el.name] <= el.data[1] ? true : false
					})
				})
				break;	
		}

	}

	prods = prods.reduce((res, current) => {

		let once = false
		
		res.forEach(r => {

			r.article.slice(0,-2) == current.article.slice(0,-2)
			&& (once = true)

		})

		!once && res.push(current)
		return res
		
		
	},[prods[0]])
	
	console.log('filtered prods:',prods)
	return prods
	
}

function draw_products(state,prods){

	// draw pagination

	let res = prepare_pagination(prods.length)
	draw_pagination(res)
	lis()

	// sort
	if(state.sort){
		state.sort == 'desc'
		? prods = prods.sort((a,b) => a.price - b.price)
		: prods = prods.sort((a,b) => b.price - a.price)
	}


	// pagination ?
	let perpage = state.pagination.perpage
	let curpage = state.pagination.page
	state.pagination.page > 1
	? prods = prods.slice(perpage*curpage-9,perpage*curpage)
	: prods = prods.slice(0,perpage)

	

	

	if(prods[0] == undefined){
		qs('ul.prod-list').innerHTML = '<span>Продуктов не найдено</span>'
		return
	}
	
	
	let str = ``

	prods.forEach(prod => {


		str += `
			<li data-prodid="${prod.resid}">
				<img src="${cfg.host}/assets/images/products/${prod.resid}/medium/${prod.image[0].toLowerCase()}.jpg" width="302" heigth="288">
				<div class="colors loading"></div>
				<a href="${ cfg.host +"/"+ prod.uri}">${prod.name}</a>

					<span class="size">${prod.width + " x " + prod.height + " x "+ prod.length}</span>
					
					<div class="price">
						<span byn="${prod.price}" ${prod.discount ? `prod_discount="${prod.discount}"`: ""}>${prod.price}</span>
						<span class="cur">BYN</span>
						<img class="cart" src="/assets/img/icons/bag.svg" width="20" heigth="23">
					</div>
			</li>
		`
	})
	qs('ul.prod-list').innerHTML = str

	// prods передать в функцию отрисовки цвета
	// обнаружить модификации
	// и врисовать в уже готовую разметку
	// это облегчит и вывод продуктов на сервере
	// т.к. можно будет дернуть эту ф-цию и передать ей разметку/массив продуктов

	dx.colors_prod_list(prods.map(el => el.resid))

	// слушатель добавить в корзину
	cart.add(qsa("ul.prod-list li img.cart"))
	replace_currency()

}



async function color_html_prods(){
	let db = dx.init()
	let ids = Array.from(qsa('#prods ul.prod-list li[data-prodid]')).map(el => +el.dataset.prodid)
	
	let arr = [];

	for(const id of ids){
		let res = await db.mod.where('ids').anyOf(id).toArray()
		res.length && arr.push(id)
	}
	dx.colors_prod_list(arr)
}

function open_close_mobile(){
	let f = qs('#pagination img.filter')
	f.addEventListener("click", event => {
		f.classList.toggle('open')
		qs("#filter").classList.toggle('open')
	})

	document.addEventListener("click", event => {
		if(event.target == f) return
		if(qs("#filter").contains(event.target)) return
		qs("#filter").classList.remove('open')
	})
}