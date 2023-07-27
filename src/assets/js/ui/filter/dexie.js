import { qs,xml } from "../../libs";

export const dx = {
	ed: document.head.querySelector('[name="editedon"]').getAttribute("content"),
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

			// ответ сервера

		  // products:[...]
			// categories: [{ id, parent, editedon, cfg] }]

		// обновить товары в таблице prod
		// обновить запись в таблице cat текущим хэшом из метатега поле editedon и конфигурацией фильтра поле cfg
		// распарсить товары и сконфигурировать js объект фильтра и обновить в таблице cat поле filter

		

		let obj = [{
			id: resid,
			editedon: this.ed
		}]

		let res = await xml('get_products',obj,'/api/').then(r => JSON.parse(r));

		let db = this.init()
		db.open();
		

		// fill products table
	
		if(res.products.length){

			Object.keys(res.categories).forEach(async i => {
				
				// i = catid
				
				await db.prod
					.where({catid: +i})
					.delete()
					
			})
			
			await db.prod.bulkPut(res['products'])	
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
		
		return !res.length ? false : true

	},

	async validate_children(){
		
		if(!qs('script[children]')) return false
		let db = this.init()
		db.open();

		let newRecords = new Set();

		for(const item of children){
			let recordid = await db.cat.where({catid: item.id}).toArray()
			

			!recordid.length && newRecords.add(item.id)

		
		
			if(recordid[0] && recordid[0].editedon){
				//console.log(recordid[0]?.editedon, item.editedon)
			}
			//(recordid[0]?.editedon !== item.editedon) && newRecords.add(item.id)

		}

		await check_deleted_category()
		return newRecords


	},

	async update_children(catids){
		
		
		let db = this.init()
		db.open();

		let arr = [];
		children.forEach(el => {
			catids.has(el.id) && arr.push({id: el.id, editedon: el.editedon})
		})
		
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
			
				// удалить товары категории
			
				await db.prod.where({catid: item.id}).delete()
		}
		
		// add products to table prod
		await db.prod.bulkPut(res.products)


	},
	async construct_filters(){

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