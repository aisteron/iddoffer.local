import { qs,xml } from "../../libs";
import { ls } from "./store";

export const dx = {
	
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
	async update(){

		let resid = +qs("body").getAttribute("resid")
		let editedon = document.head.querySelector('[name="editedon"]').getAttribute("content")
		let obj = await xml('get_filters_and_products',{id: resid},'/api/').then(r => JSON.parse(r))

		let db = this.init()
		db.open();

		// update filters in cat.table

		let recordid = await db.cat.get({catid: resid})

		!recordid
			? await db.cat.put({catid: resid, editedon: editedon, filter: obj.filters})
			: await db.cat.update(recordid, {catid: resid, editedon: editedon, filter: obj.filters})

		// fill products table 

		await db.prod
			.where({catid: resid})
			.delete()
		await db.prod.bulkPut(obj.products);
		
		ls.update()

	}

}