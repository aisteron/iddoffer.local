import { cfg, load_toast, qs, qsa, xml } from "../libs"
import { dx } from "../ui/filter/dexie";
import { swiper, product_slider } from "../ui/components/sliders/product-slider";
import { cart } from "./cart";
import { replace_currency } from "../ui/components/desktop.menu";

export async function prod(){
	if(!qs('.prod-page')) return
	
	tabs()
	social_share()

	await dx.load()
	!await dx.validate_mods() && await dx.fill_mods()
	await draw()
	listeners()
	

	
	// callback popup
	cb_form()
	cb_question()
	
	// добавить в корзину
	cart.add(qsa(".cart-compare button.cart"))
	
	// похожие товары
	qs('.similar img.cart') && cart.add(qsa(".similar img.cart"))
	
	// товары на скидке
	qs('.discount img.cart') && cart.add(qsa(".discount img.cart"))

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
			console.log(idx)
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

	let str = ``
	if(res.discount){
		str += `<div class="op">
			<span>от</span>
			<span byn="${res.price}">${res.price}</span>
			<span class="cur">BYN</span>
			</div>`
		let final = (res.price*(100-res.discount)/100).toFixed(2)
		str += `<div class="from"><span>от</span><span byn="${final}">${final}</span><span class="cur">BYN</span></div>`
	} else {
		str += `<div class="from"><span>от</span><span byn="${res.price}">${res.price}</span><span class="cur">BYN</span></div>`
	}
	
	if(res.old_price){
		if(res.discount){
			str += `<div class="op">
			<span>до</span>
			<span byn="${res.old_price}">${res.old_price}<span>
			<span class="cur">BYN</span>
			</div>`
			let final = (res.old_price*(100-res.discount)/100).toFixed(2)
			str += `<div class="to"><span>до</span><span byn="${final}">${final}</span><span class="cur">р.</span></div>`
		} else {
				str += `<div class="to"><span>до</span><span byn="${res.old_price}">${res.old_price}</span><span class="cur">р.</span></div>`
		}
	}
	qs('.dsc .price').innerHTML = str
	replace_currency()


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

function cb_form(){
	if(!qs('.cb.callback')) return
	
	// open / hide
	qs('.colors-click-q .click span').addEventListener('click', event => {
		qs('.cb.callback').classList.add('open')
	})

	qs('.cb.callback img.close').addEventListener('click', event => {
		qs('.cb.callback').classList.remove('open')
	})

	document.addEventListener("click", event => {
		if(event.target == qs('.colors-click-q .click span')) return
		if(event.target == qs('.cb.callback img.close')) return
		if(qs('.cb.callback').contains(event.target)) return
		qs('.cb.callback').classList.remove('open')
	})

	// submit

	qs('.cb.callback form').addEventListener('submit', async event => {
		
		event.preventDefault()

		let input = qs("input[type='text']", event.target)
		
		let obj = {
			tel: input.value,
			resid: +qs('body').getAttribute('resid')
		}

		let res = await xml("callback", obj, '/api/')
		res = JSON.parse(res)
		
		await load_toast()
		
		if(res.success){
			new Snackbar("Успешно отправлено")
			input.value = ''
			qs('.cb.callback').classList.remove('open')
		} else {
			new Snackbar("Ошибка отправки")
		}
		
	})
}

function cb_question(){
	if(!qs('.cb.q')) return

	// open / hide
	qs('.colors-click-q .q span').addEventListener('click', event => {
		qs('.cb.q').classList.add('open')
	})

	qs('.cb.q img.close').addEventListener('click', event => {
		qs('.cb.q').classList.remove('open')
	})

	document.addEventListener("click", event => {
		if(event.target == qs('.colors-click-q .q span')) return
		if(event.target == qs('.cb.q img.close')) return
		if(qs('.cb.q').contains(event.target)) return
		qs('.cb.q').classList.remove('open')
	})

	// submit

	qs('.cb.q form').addEventListener('submit', async event => {
		
		event.preventDefault()

		let email_input = qs("input[type='text']", event.target)
		let ta = qs("textarea", event.target)
		
		let obj = {
			email: email_input.value,
			q: ta.value,
		}


		let res = await xml("question", obj, '/api/')
		res = JSON.parse(res)
		
		await load_toast()
		
		if(res.success){
			new Snackbar("Успешно отправлено")
			email_input.value = ''
			ta.value = ''
			qs('.cb.q').classList.remove('open')
		} else {
			new Snackbar("Ошибка отправки")
		}
		
	})

}

function social_share(){
	if(!qs(".share")){console.log('share buttons not found'); return}

	let obj = {
		url: window.location.href,
		title: qs('h1').innerHTML
	}
	
	qsa(".share a").forEach(el => {
		switch(el.classList[0]){
			case 'vk':
				qs('a.vk').href = `https://vk.com/share.php?url=${obj.url}&title=${obj.title}`;
				break;
			case 'tw':
				qs('a.tw').href = `https://twitter.com/intent/tweet?text=${obj.title}&url=${obj.url}`;
				break;
			case 'ok':
				qs('a.ok').href = `https://connect.ok.ru/offer?url=${obj.url}&title=${obj.url}`;
				break;
		}
	})
}