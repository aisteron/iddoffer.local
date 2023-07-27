import { qs,xml } from "../../libs";
//import { ls } from "./store";

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
        editedon,
				filter
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
			// categories: [{ resid: ['конфиг фильтра', editedon] }]

		// обновить товары в таблице prod
		// обновить запись в таблице cat текущим хэшом из метатега поле editedon и конфигурацией фильтра поле cfg
		// распарсить товары и сконфигурировать js объект фильтра и обновить в таблице cat поле filter

		

		let obj = [{
			id: resid,
			editedon: this.ed
		}]

		await xml('get_products',obj,'/api/').then(r => JSON.parse(r))
		
		
		
		let db = this.init()
		db.open();

		// асинхронно в цикле удалить товары из таблицы
		// потом добавить
		

		// update filters in cat.table

		// let recordid = await db.cat.get({catid: resid})

		// !recordid
		// 	? await db.cat.put({catid: resid, editedon: editedon, filter: obj.filters})
		// 	: await db.cat.update(recordid, {catid: resid, editedon: editedon, filter: obj.filters})

		// // fill products table 

		// await db.prod
		// 	.where({catid: resid})
		// 	.delete()
		// await db.prod.bulkPut(obj.products);
		
		// ls.update()

	},
	async validate_editedon(){
		let db = this.init()
		db.open()
		let res = await db.cat.where({editedon:this.ed}).toArray()
		
		return !res.length ? false : true

	},

	async validate_children(){
		return false
	},
	async update_children(){
		return false
	}


}