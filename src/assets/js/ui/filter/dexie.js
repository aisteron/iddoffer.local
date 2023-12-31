import { qs,xml,cfg,declension, load_toast } from "../../libs";



export const dx = {
	ed: document.head.querySelector('[name="editedon"]')?.getAttribute("content"),
	async load(){
		
		return new Promise(resolve =>{
			if(qs(['dexie'])){resolve(true); return}
			
			let script = document.createElement("script")
			script.src="/vendors/dexie.min.js"
			script.setAttribute("dexie","")
			qs(".scripts-area").appendChild(script)
			
			script.onload = () => resolve(true)
		})
	},
	
	init(){

		// https://dexie.org/docs/MultiEntry-Index

		const db = new Dexie("common");
		
		db.version(1).stores({
      cat: `
        ++id,
        catid,
				parent,
        editedon,
				filter,
				cfg
				`,
			prod:`
				++id,
				resid,
				catid,
				article,
				name,
				url,
				brand,
				color,

				editedon,

				*material_facade,
				*material_body,
				*material_upholstery,

				width,
				height,
				length,

				image,

				is_designed,
				discount,

				price,
				old_price
			`,
			mod: `
				++id,
				article,
				editedon,
				*ids,
				prods
				`	
    });

		return db;

	},

	async update_editedon(){

		let resid = +qs("body").getAttribute("resid")

		
		// this.ed - текущий хэш страницы
		// resid - текущий id страницы
		// получить свежие товары по id

			// запрос к серверу POST → [{resid : editedon }]
			// особого смысла отправлять editedon нет, но для children мы будет отправлять невалидные хэши
			
			// • мы на фронте решаем, что хэши невалидные и можем отправить только id
			// сервер будет точно знать, что для присланного id категории нужные товары и прочие поля categories[]

			// ответ сервера

		  // products:[...]
			// categories: [{ id, parent, editedon, cfg] }]

		// обновить товары в таблице prod
		// обновить запись в таблице cat текущим хэшом из метатега поле editedon и конфигурацией фильтра поле cfg
		// распарсить товары и сконфигурировать js объект фильтра и обновить в таблице cat поле filter

		

		// let obj = [{
		// 	id: resid,
		// 	editedon: this.ed
		// }]

		let res = await xml('get_products',[{id: resid}],'/api/').then(r => JSON.parse(r));

		let db = this.init()
		db.open();
		

		// fill products table
	
		if(res.products.length){

			for( const item of res.categories){
				await db.prod
					.where({catid: item.id})
					.delete()
			}	
			await db.prod.bulkPut(res.products)	
		}	


		// update filters in cat.table

		for(const item of res.categories){
				
			let obj = {
				catid: item.id,
				parent: item.parent,
				editedon: item.editedon,
				filter: "",
				cfg: item.cfg
			}

			let recordid = await db.cat.get({catid: item.id})
			
			!recordid
				? await db.cat.put(obj)
				: await db.cat.update(recordid, obj)
		}




	},
	async validate_editedon(){
		let db = this.init()
		db.open()
		
		let resid = +qs('[resid]').getAttribute('resid')
	
		let res = await db.cat.where({editedon:this.ed})
													.and(cat => cat.catid == resid).toArray()
		
		return !res.length ? (console.log(`%c resid = ${resid}, editedon "${this.ed}" invalid`,"color: #666"),false) : true

	},

	async validate_children(){

		// <script children> loop
		// если в таблице cat нет записи
		// или если хэш не совпадает
		
		if(!qs('script[children]')) return false
		let db = this.init()
		db.open();

		let newRecords = [];

		for(const item of children){
			let recordid = await db.cat.where({catid: item.id}).toArray()
			
			if(recordid.length == 0){
				newRecords.push(item.id)
			} else {
				if(recordid[0].editedon !== item.editedon) newRecords.push(item.id)
			}

		}
		!newRecords.length && console.log(`%c children актуальны`, 'color: #666')
		await check_deleted_category()
		return newRecords


	},

	async update_children(catids){

		// catid - массив children для обновления их продуктов
		// возвращает [categories:[], products:[]]
		// добавляем / удаляем запись в таблице cat
		// удаляем продукты категорий
		// добавляем продуты в таблицу prod
		
		
		let db = this.init()
		db.open();

		let arr = [];
		children.forEach(el => catids.includes(el.id) && arr.push({id: el.id}))

		let res = await xml('get_products',arr,'/api/').then(r => JSON.parse(r))

		// update table cat
		for(const item of res.categories){
			let recordid = await db.cat.get({catid: item.id})
			let obj = {
				catid: item.id,
				parent: item.parent,
				editedon: item.editedon,
				filter: "",
				cfg: item.cfg
			}
			!recordid
				? await db.cat.put(obj)
				: await db.cat.update(recordid, obj)
			
				// удалить товары категорий children
			
				await db.prod.where({catid: item.id}).delete()
		}
		
		// add products to table prod
		await db.prod.bulkPut(res.products)
		let decl = declension(res.products.length, ['товар', 'товары', 'товаров'])
	
		console.log(`%c добавил ${res.products.length} ${decl}`, 'color: green')


	},
	async construct_filters(){

		// по id ресурса resid найти в dexie таблице cat конфигурацию фильтра

		// из html тега <script dictionary> взять словарь
		// сконструировать массив объектов resp для помещения его в таблицу cat в поле filter
		// resp будет содержать [{ name, label, data['белый','черный'] }]

		// const dict - <script dictionary>

		let resid = +qs("[resid]").getAttribute("resid");
		let prods = [];
		let cfg = '';
		let resp = [];
		let ids = []; // id категорий или категории - на основе которой будет сконструирован объект фильтра (на основе товаров)
		
		let db = this.init()
		db.open();

		qs('script[children]')
			? ids = children.map(el => el.id)
			: ids.push(resid)

		prods = await db.prod.where('catid').anyOf(ids).toArray()
		if(!prods.length) {console.log(`%c не нашел товары для построения фильтра`,'color: red'); return}
		
		cfg = await db.cat.where({catid: resid}).toArray()
		
		cfg = cfg[0].cfg.split(",")


		cfg.forEach(c => {
			switch(c){
				case 'color':
				case 'brand':
				case 'material_facade':
				case 'material_body':
				case 'material_upholstery':
					resp.push(default_checkbox(c,prods))
					break;
				case 'size':
					resp.push(size(prods))
					break;
				case 'design':
					resp.push({name: 'design', label: dict['design']})	
			}
		})


		let recordid = await db.cat.where({catid: resid}).toArray()
		let response = await db.cat.update(recordid[0].id, {filter: resp})
		if(response !== 1) console.log('%c ошибка обновления фильтра в категории', 'color: red')

	},
	async validate_mods(){
		let db = this.init()
		let eo = ''

		document.head.querySelector('meta[name="editedon"]')
		&& (eo = [document.head.querySelector('meta[name="editedon"]').content])
		
		document.head.querySelector('meta[name="parenteditedon"]')
		&& (eo = [document.head.querySelector('meta[name="parenteditedon"]').content])
		 
		qs('script[children]') && (eo = children.map(el => el.editedon))
		
		let valid = false
		for(const e of eo){
			let res = await db.mod.where({editedon: e}).toArray()
			if(res.length){ valid = true; return valid}
		}
		return valid

	},
	async construct_mods(){
		let db = this.init()
		let ids = []
		qs('script[children]')
			? ids = children.map(el => el.id)
			: ids.push(+qs("[resid]").getAttribute("resid"))
		
		let prods = await db.prod.where('catid').anyOf(ids).toArray()	
		let cats = await db.cat.toArray()
		
		

		let arr = prods.reduce((acc, cur) =>{
		
			let obj = {
				article: null,
				ids: [],
				prods: [],
				editedon: null
			}

			if(!acc.length){
				create_new(cats,obj,cur,acc)
				return acc
			}

			let once = false

			acc.forEach(el => {
					
				if(el.article == cur.article.slice(0,-2)){
					el.ids.push(cur.resid)
					construct_obj(el,cur)
					once = true
				}

			})

			!once && create_new(cats,obj,cur,acc)

			return acc
		},[])


		if(arr.length){

			for(const a of arr){
				await db.mod.where({article: a.article}).delete()
				await db.mod.put(a)
			}

		} else {
			console.log('Не нашел модификаций для вставки в db.mod')
		}


	},
	async colors_prod_list(resids){

		// COLORS в <script>
		if(!qs('[colors]')){
			console.log('%c Не нашел <script colors>', 'color:red; background-color: #fff')
			return
		}

		let db = this.init()
		
		for(const resid of resids){

			let res = await db.mod.where('ids').anyOf(resid).toArray()

			!res.length
			? console.log('Не нашел товар среди таблицы db.mod')
			: multi_prod_color(resid,res)

		}
	},
	async clean(){
		let db = this.init()
		await db.delete()
		await load_toast()
		new Snackbar("База почищена. Обновите страницу")
	},


	// prod page

	async fill_mods(){
		let db = dx.init()
		let resid = +qs('[resid]').getAttribute('resid')
		let arr = await xml('get_modifications', {id: resid}, '/api/')
		arr = JSON.parse(arr)
		
		if(arr){
			await db.mod.where({article: arr.article}).delete()
			await db.mod.put(arr)
		} else {
			console.log('Что-то не так с ответом сервера')
		}

	}

}


async function check_deleted_category(){
	
	// если от сервера придет меньше детей, чем сохранено
	// то надо удалить записи из таблицы cat и продукты из таблицы prod
	
	let db = dx.init()
	db.open();

	let children_parent = children[0].parent
	let dexie_cats = await db.cat.where({parent: children_parent}).toArray()
			dexie_cats = dexie_cats.map(el => el.catid)
	
	let ch_ids = children.map(el => el.id)
	
	
	

	if(children.length < dexie_cats.length){

		let m = dexie_cats.filter(el => !ch_ids.includes(el))
		console.log('%c Eсть удаленные категории на сервере. Удаляю в dexie категорию и товары','color: #ccc');
		m.forEach(el => console.log('CATID: ', el))
		
		for(const i of m){
			await db.cat.where({catid: i})
				.delete()
			
			await db.prod.where({catid: i})
				.delete()
		}
	}
}

function default_checkbox(config_name, prods){
	
	let data = new Set()


	prods.forEach(el =>{
		
		Array.isArray(el[config_name])
		? el[config_name].forEach(el => data.add(el))
		: data.add(el[config_name])

	})
	

	let obj = {
		name: config_name,
		label: dict[config_name],
		data: Array.from(data)
	}

	
	return obj
	


}
function size(prods){
	let width = new Set(), height = new Set(), length = new Set();
	prods.forEach(el => {
		width.add(el.width)
		height.add(el.height)
		length.add(el.length)
	})
	
	let wmin  = Math.min(...width);
	let wmax  = Math.max(...width);

	let hmin  = Math.min(...height);
	let hmax  = Math.max(...height);

	let lmin  = Math.min(...length);
	let lmax  = Math.max(...length);

	return {
		name: 'size',
		width: [wmin, wmax],
		height: [hmin, hmax],
		length: [lmin, lmax],
	}

}

function construct_obj(obj,cur){
	

  obj.prods.push({
    id: cur.resid,
    article: cur.article,
    color: cur.color,
    uri: cur.uri,
    name: cur.name,
    material_facade: cur.material_facade,
    price: cur.price,
    old_price: cur.old_price,
    image: cur.image,
    discount: cur.discount
  })
  return obj
}

function create_new(cats,obj,cur,acc){
  let cat = cats.filter(c => c.catid == cur.catid )
  obj.editedon = cat[0].editedon
  obj.article = cur.article.slice(0,-2)
  obj.ids.push(cur.resid)
  construct_obj(obj,cur)
  acc.push(obj)
}

async function single_prod_color(){

		console.log('single')
		return;
		// single prod

		console.log(`%c Продукт id = ${resid} без модификаций`, 'color: #666');
	
	
		let prod = await db.prod.where({resid:resid}).toArray()
		if(!prod.length){console.log(`Продукт с id = ${resid} не найден в db.prod`)}
		
		let item = COLORS.filter(co => co.name == prod[0].color)
		
		if(!item.length){
			console.log(`%c Нет цвета / материала «${prod[0].color}» в конфиге`, 'color: red')
		} else {
			item = item[0]
			if(!qs(`li[data-prodid="${resid}"] .colors .item[data-id="${item.id}"]`)){
				str += `<div class="item" data-id="${item.id}"
				${item.image ? `style="background-image:url(${cfg.host}/${item.image})"`:""}
				${item.code ? `style="background-color: ${item.code}; ${item.code == '#fff' ? `border-color: #ccc`: ``}"` : ``}
			></div>`
			}
			

			//qs(`li[data-prodid="${resid}"] .colors`).innerHTML = str
			qs(`li[data-prodid="${resid}"] .colors`).insertAdjacentHTML('beforeend', str)
			qs(`li[data-prodid="${resid}"] .colors`).classList.remove('loading');
		}
		
}

async function multi_prod_color(resid,res){

	let colors = res[0].prods.map(el => el.color) // ['Белый, Черный'] из запись из db.mod
	let arr = []
	let str = ``

	colors.forEach(c => {		
				
		let item = COLORS.filter(co => co.name == c)[0]
		
		if(!item){
			console.log(`%c Нет цвета / материала «${c}» в конфиге`, 'color: red')
		} else {


				let obj = {id: item.id}
				item.image ? obj.image = item.image : obj.code = item.code
				
				!arr.filter(el => el.id == item.id).length
				&& arr.push(obj)
				

		}
		


	})

	arr.forEach(item => {
		str += `<div class="item" data-id="${item.id}"
		${item.image ? `style="background-image:url(${cfg.host}/${item.image})"`:""}
		${item.code ? `style="background-color: ${item.code}; ${item.code == '#fff' ? `border-color: #ccc`: ``}"` : ``}
		></div>`
	})
	
	qs(`li[data-prodid="${resid}"] .colors`).innerHTML = str
	qs(`li[data-prodid="${resid}"] .colors`).classList.remove('loading')

}