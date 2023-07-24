import { qs } from "../../libs";

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

		const db = new Dexie("common");
		
		db.version(1).stores({
      cat: `
        ++id,
        catid,
        hash,
				filter
				`,
			prod:`
				++id,
				catid,
				name,
				url,
				color,

				material_facade,
				material_body,
				material_upholstery,

				width,
				height,
				length,

				image,

				is_designed,

				price
			`	
    });

	}

}