import { cfg, qs, qsa } from "../libs"
import { dx } from "../ui/filter/dexie";
import { swiper, product_slider } from "../ui/components/sliders/product-slider";

export async function prod(){
	if(!qs('.prod-page')) return
	
	tabs()

	await dx.load()
	!await dx.validate_mods() && await dx.fill_mods()
	await draw()
	listeners()

}

function tabs(){
	if(!qs("section.tabs")){console.log("%c tabs not found", "color: #666"); return}

	let head_tabs = qsa("section.tabs ul.head li")
	head_tabs.forEach(el => {
		el.addEventListener("click", event => {

			//underline
			head_tabs.forEach(el => el.classList.remove("active"))
			event.target.classList.add("active")



			let idx = event.target.dataset.index

			qsa(`.body [data-index]`).forEach(el => el.classList.remove("open"))

			qs(`.body [data-index="${idx}"]`).classList.add("open")
		})
	})
}

async function draw(){
	let db = dx.init()
	let resid = +qs('[resid]').getAttribute("resid")
	let res = await db.mod.where('ids').anyOf(resid).toArray()
	let str = ``
	if(!res.length){console.log('Не нашел модификации продукта'); return}
	
	res[0].prods.map(el => [el.color, el.id]).forEach(c =>{
		let color = COLORS.filter(co => co.name == c[0])[0]
		let st = ``
		color.code
		? st += `style="background-color: ${color.code}"`
		: st += `style="background-image: url(${cfg.host}/${color.image})"`
		
		str += `
			<li data-prodid="${c[1]}" ${c[1] == resid ? `class="active"`: ""}>
				<span class="color" ${st}></span>
				<span class="name">${color.name}</span>
			</li>`
	})

	qs('.colors-click-q .colors ul').classList.remove('loading')
	qs('.colors-click-q .colors ul').innerHTML = str
}

function listeners(){
	//let resid = +qs('[resid]').getAttribute("resid")
	let lis = qsa('.colors-click-q .colors ul li')
	lis.forEach(el => {
		el.addEventListener("click", event => {
			let etdp = +event.target.dataset.prodid
			//if(etdp == resid) return
			lis.forEach(li => li.classList.remove('active'))
			event.target.classList.add('active')
			redraw(etdp)
			
		})
	})
}

async function redraw(id){
	let db = dx.init()
	let res = await db.mod.where('ids').anyOf(id).toArray()
	res = res[0].prods.filter(el => el.id == id)
	if(!res.length){console.log('Не нашел модификацию продукта'); return}
	res = res[0]

	qs('[resid]').setAttribute("resid", res.id)

	qs('h1').innerHTML = res.name
	qs('ul.stats .article').innerHTML = res.article
	qs('ul.stats .material_facade').innerHTML = res.material_facade.join()

	let str = `<div class="from"><span>от</span><span byn="${res.price}">${res.price}</span><span class="cur">р.</span></div>`
	res.old_price && (str += `<div class="to"><span>от</span><span byn="${res.old_price}">${res.old_price}</span><span class="cur">р.</span></div>`)
	qs('.dsc .price').innerHTML = str


	if (window.history.replaceState) {
		//prevents browser from storing history with each change:
		//window.history.replaceState(null, "", cfg.host+"/"+res.uri);
 }

 	// swiper reinit
	swiper.destroy()

	str = ``
	
	res.image.split(",").forEach(num => {
		str += `
		<div class="swiper-slide">
			<img src="${cfg.host}/assets/images/products/${res.id}/${num}.jpg" width="646" height="549"/>
		</div>
		`
	})
	
	qs('.main .swiper-wrapper').innerHTML = str

	str = ``
	res.image.split(",").forEach(num => {
		str += `
		<div class="swiper-slide">
			<img src="${cfg.host}/assets/images/products/${res.id}/small/${num}.jpg"/>
		</div>
		`
	})

	qs('.thumbs .swiper-wrapper').innerHTML = str

	swiper.destroy()
	product_slider()


}