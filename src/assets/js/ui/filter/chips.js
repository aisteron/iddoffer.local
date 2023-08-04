import { qs, qsa } from "../../libs";
import { store,chips } from "./store";

export function Chips(){

	store.subscribe(_ => {

		let state = store.getState()
		
		draw_chips(state)
		listeners()
		uncheck(state)
			
	})
}

function listeners(){
	qsa('#chips img.close').forEach(el => {
		el.addEventListener('click', event => {
			let name = event.target.closest('[data-name]').dataset.name
			let value = event.target.previousElementSibling.innerHTML
			store.dispatch(chips({name, value}))
			
		})
	})
}

function draw_chips(state){

	if(!state.filters.length){ qs('#chips').innerHTML = ''; return }

	let str = ``

		state.filters.forEach(f => {

			switch(f.name){
				case 'color':
				case 'brand':
				case 'material_upholstery':
				case 'material_body':
				case 'material_facade':
					f.data.forEach(d => {
						str += `<li data-name="${f.name}"><span>${d}</span> <img class="close" src="/assets/img/icons/close.svg"></li>`
					})		
					break;
				case 'design':
					str += `<li data-name="${f.name}"><span>${dict['design']}</span> <img class="close" src="/assets/img/icons/close.svg"></li>`
					break;
				case 'size':
					f.data.forEach(d => {
						// d.name = width
						// d.data = [null, 0]
						
						let param = ''
						str += `<li data-name="${d.name}">`

						
						switch(d.name){
							case 'width':
								param = 'ширина';
								break;
							case 'height':
								param = 'высота';
								break;
							case 'length':
								param = 'длина';
								break;	
						}

						d.data[0] == null && (str += `<span>${param}: до ${d.data[1]} мм</span> `);
						d.data[1] == null && (str += `<span>${param}: от ${d.data[0]} мм</span> `);
						(d.data[0] && d.data[1]) && (str += `<span>${param}: от ${d.data[0]} до ${d.data[1]} мм</span> `)
						
						
						str += `<img class="close" src="/assets/img/icons/close.svg"></li>`
					})	
			}

			
		})

		qs('#chips').innerHTML = str
}

function uncheck(state){

	// сброс чекбоксов, при клике на крестик чипса

	state.filters.forEach(f => {
		switch(f.name){
			case 'color':
			case 'brand':
			case 'material_body':
			case 'material_facade':
			case 'material_upholstery':
				let names = []
				qsa(`[data-name="${f.name}"] span.name`).forEach(span => names.push(span.innerText))
				
				let intersection = names.filter(n => !f.data.includes(n))
				
				if(!intersection.length) return
				intersection.forEach(i => {
					qsa(`[data-name="${f.name}"] span.name`).forEach(span => {
						span.innerText == i && (qs('input',span.closest('label')).checked = false)
					})
				})
			break;

			case 'size':
				
				!f.data.find(d => d.name == 'width')
				&& qsa(`[data-name="width"] input`).forEach(i => i.value = '')
				
				!f.data.find(d => d.name == 'length')
				&& qsa(`[data-name="length"] input`).forEach(i => i.value = '')
				
				!f.data.find(d => d.name == 'height')
				&& qsa(`[data-name="height"] input`).forEach(i => i.value = '')

				break;

				


		}
	})
	
	!state.filters.find(f => f.name == 'color')
	&& qsa(`[data-name="color"] input`).forEach(i => i.checked = false)
	
	!state.filters.find(f => f.name == 'brand')
	&& qsa(`[data-name="brand"] input`).forEach(i => i.checked = false)
	
	!state.filters.find(f => f.name == 'material_body')
	&& qsa(`[data-name="material_body"] input`).forEach(i => i.checked = false)
	
	!state.filters.find(f => f.name == 'material_facade')
	&& qsa(`[data-name="material_facade"] input`).forEach(i => i.checked = false)
	
	!state.filters.find(f => f.name == 'material_upholstery')
	&& qsa(`[data-name="material_upholstery"] input`).forEach(i => i.checked = false)
	
	!state.filters.find(f => f.name == 'design')
	&& (qs(`.item.design input`) && (qs(`.item.design input`).checked = false))

	!state.filters.find(f => f.name == 'size')
	&& qsa(`[data-name="size"] input`).forEach(i => i.value = '')

	
}

// изменить логику отрисовки цветов модификации карточки товара
// завести таблицу модификаций (она все равно будет нужна для страницы продукта)

// пагинация: добавить больше продуктов
//
// сортировка