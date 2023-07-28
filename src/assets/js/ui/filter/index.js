import { load_toast, qs, qsa, xml } from '../../libs';
import { dx } from './dexie';
import { store, incremented, decremented } from './store';

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

	await dx.load()
	
	let ed = await dx.validate_editedon()
	!ed && await dx.update_editedon()


	if(qs('script[children]')){
		let resp = await dx.validate_children()
		resp.length && dx.update_children(resp)
	}

	await dx.construct_filters()
	draw()



	store.subscribe(() => console.log(store.getState()))
	store.dispatch(incremented())
	store.dispatch(incremented())
	store.dispatch(decremented())


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
					<div class="row">
						<input type="number" min="${f.width[0]}" placeholder="${f.width[0]}" />
						<input type="number" max="${f.width[1]}" placeholder="${f.width[1]}" />
					</div>
				</div>	
				
				<div class="size">	
					<span>Длина, мм</span>
					<div class="row">
						<input type="number" min="${f.length[0]}" placeholder="${f.length[0]}" />
						<input type="number" max="${f.length[1]}" placeholder="${f.length[1]}" />
					</div>
				</div>
				
				<div class="size">	
					<span>Высота, мм</span>
					<div class="row">
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



// redux разобраться
// стейт для фильтра и продуктов