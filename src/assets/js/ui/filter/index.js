import { load_toast, qs, qsa, xml } from '../../libs';
import { dx } from './dexie';
import { store, incremented, decremented, ls } from './store';

export async function Filter() {
	//accordeon()

	await dx.load()
	ls.valid() ? draw() : dx.update()



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



// redux разобраться
// стейт для фильтра и продуктов