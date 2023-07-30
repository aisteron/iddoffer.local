import { qs,xml } from "../../libs";



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

				price,
				old_price
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
		let res = await db.cat.where({editedon:this.ed}).toArray()
		
		return !res.length ? (console.log(`%c editedon "${this.ed}" invalid`,"color: #666"),false) : true

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
		console.log(`%c добавил ${res.products.length} товар`, 'color: green')


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