import { qs, qsa, xml } from "../../libs";
import { cart } from "../../pages/cart";
export async function desktop_menu(){

	dropdown_menu()
	search()
	

	// header currency dropdown

	await currency()
	currency_show()
	replace_currency()

	// count products in cart icon
	await cart.draw_cart_count()
	
}

function dropdown_menu(){

	if(!qs('nav.header li.dd')) return

	qs('nav.header li.dd span').addEventListener("click", event => {
		event.target.closest('li').classList.toggle('open')
	})


	document.addEventListener("click", event => {
		if(event.target == qs('nav.header li.dd span')) return
		if(qs('nav.header li.dd').contains(event.target)) return
		qs('nav.header li.dd').classList.remove('open')
	})
}

function currency_show(){

	if(!qs('.cl .currency')) return
	qs('.cl .currency span').addEventListener('click', event => {
		event.target.closest('.dd').classList.toggle('open')
	})
	
	
	document.addEventListener("click", event => {
		if(event.target == qs('.cl .currency span')) return
		if(qs('.cl .currency').contains(event.target)) return
		qs('.cl .currency').classList.remove('open')
	})

	// draw li

	let cur = JSON.parse(localStorage.getItem('cur'))
		.filter(el => !el.ts)
		.filter(el => !el.current)
		.map(el => el.key)

	cur.unshift('BYN')
	let str = ``	
	cur.forEach(el =>  str += `<li>${el}</li>`)
	qs('.currency.dd ul').innerHTML = str

	// add listener

	qsa('.currency.dd ul li').forEach(li => {

		li.addEventListener('click', event => {

			let ev = new CustomEvent("cur", {
				detail: {
					cur: event.target.innerHTML
				}
			})
			
			document.dispatchEvent(ev)

			qs('.currency.dd span').innerHTML = event.target.innerHTML
			qs('.currency.dd').classList.remove('open')

		})
	})

	// draw current

	cur = JSON.parse(localStorage.getItem('cur')).filter(el => el.current)
	if(cur.length){
		let current = cur[0].current
		if(current !== 'BYN') qs('.currency.dd span').innerHTML = current
	}

	// global listener

	document.addEventListener("cur", e => {
		
		let c = e.detail.cur
		let cur = JSON.parse(localStorage.getItem("cur"))
		
		cur.some(el => el.current)
		? cur.map(el => el.current ? el.current = c : el)
		: cur.push({current: c})
		
		
		localStorage.setItem('cur',JSON.stringify(cur))
		console.log('custom event cur = '+c)

		replace_currency(c)
	})



	
}

async function get_cur(){

	let cur = localStorage.getItem('cur')
	let current;
	cur && (current = JSON.parse(cur).filter(el => el.current)[0])



	let cfg = await xml('get_cur',null,'/api/')
	cfg = cfg.split(",").map(el => el.toUpperCase())
	let res = await fetch('https://www.nbrb.by/api/exrates/rates?periodicity=0').then(r => r.json())

	try {
		res = res.reduce((acc, current) =>{
			if(cfg.includes(current.Cur_Abbreviation)) acc.push({key:current.Cur_Abbreviation, value:current.Cur_OfficialRate})
			return acc
		},[])
	} catch(e){
		console.log(e)
	}
	

	res.push({ts: Date.now()})
	current && res.push(current)
	
	localStorage.setItem('cur', JSON.stringify(res))
}

async function currency(){

	let cur = localStorage.getItem('cur')
	
	if(!cur){
		await get_cur()
	} else {
		// validate timestamp
		let ts = JSON.parse(cur).filter(el => el.ts)[0].ts
		if((Date.now() - ts) / 1000 > 3600) await get_cur()
	}



}

export function replace_currency(selectedCur){

	// selectedCur <string | undefined>

	const LSCurrency = localStorage.getItem("cur")  // string | undefined
	let userDiscount = localStorage.getItem("discount") // string | undefined
	const selectedCurrencyInLocalStorage = LSCurrency ? JSON.parse(LSCurrency).filter(el => el.current)[0]?.current : null

	
	qsa('[byn]').forEach(el =>{
		
		let byn = +el.getAttribute('byn')
		let productDiscount = +el.getAttribute("prod_discount")

		let finalDiscount = (productDiscount - userDiscount ) > 0 ? productDiscount : userDiscount

		//if(userDiscount) byn = +((100 - +userDiscount)/100 * byn).toFixed(2)
		if(finalDiscount) byn = +((100 - +finalDiscount)/100 * byn).toFixed(2)

		
		switch(selectedCurrencyInLocalStorage){
			case 'BYN':
				el.innerHTML = byn;
				break;
			case 'USD':
			case 'EUR':
				let value = JSON.parse(LSCurrency).filter(el => el.key == selectedCurrencyInLocalStorage)[0].value
				el.innerHTML = (byn / value).toFixed(2)

		}
	})

	qsa('span.cur').forEach(el => el.innerHTML = selectedCurrencyInLocalStorage ? selectedCurrencyInLocalStorage : 'BYN')

	replace_cart_discount()
	replace_prod_discount()



}

function search(){
	
	// open / hide
	let img = qs('.actions .search img')
	if(!qs('.actions .search')) return
	img.addEventListener("click", event => {
		qs('.actions .search .area').classList.toggle('open')
	})

	document.addEventListener("click", event =>{
		if(event.target == img) return
		if(qs('.actions .search .area').contains(event.target)) return
		qs('.actions .search .area').classList.remove("open")
	})

	
	// send

	let button = qs('.search button[type="submit"]')

	qs('.actions .search .area form').addEventListener("submit", async event => {
		
		event.preventDefault()
		button.classList.add('loading')
		
		let res = await xml("search", {str: qs('input', event.target).value}, '/api/')
		res = JSON.parse(res)
		button.classList.remove('loading')
		qs('.actions .search .results').classList.add('open')
		
		if(res.success === false){ qs('.area .results ul').innerHTML = res.message; return;}
		
		let str = ``
		res.forEach(el => {
			str += `
			<li data-prodid="${el.id}">
				<a href="${el.uri}">${el.name}</a>
			</li>
			`
		})
		
		qs('.area .results ul').innerHTML = str
	})

}

function replace_cart_discount(){

	if(!qs('.cart-page')) return
	if(!qs('.item[key]')) return

	qsa('.item[key]').forEach(el =>{

		let prod_discount = +qs('.right .prod_discount', el).innerHTML.split("%")[0]
		let user_discount = +localStorage.getItem("discount")
		let final_discount = (prod_discount - user_discount > 0) ? prod_discount : user_discount

		let orig_price = +qs('.right .price', el).innerHTML

		let final_price = final_discount ? ((100-final_discount) / 100 * orig_price).toFixed(2) : orig_price
		let count = +qs('input[type="number"]', el).value
		
		qs('.right .prod_discount', el).innerHTML = prod_discount + '%'
		qs('.right .user_discount', el).innerHTML = user_discount + '%'
		qs('.right .final_discount', el).innerHTML = final_discount + '%'

		//qs('.right .final_price', el).innerHTML = final_price
		
		qs('.right .itog', el).innerHTML = final_price * count

			
	})

}

function replace_prod_discount(){
	let prod_discount = +qs('[prod_discount]')?.getAttribute('prod_discount')
	let user_discount = +localStorage.getItem("discount")
	let final_discount = (prod_discount - user_discount > 0) ? prod_discount : user_discount

	
	qsa('.dsc .price [byn]').forEach(el => {
		let orig_price = +el.getAttribute("byn")
		let final_price = final_discount ? ((100-final_discount) / 100 * orig_price).toFixed(2) : orig_price
		if(el.closest('.op')){
			el.innerHTML = orig_price
		}
		else {
			el.innerHTML = final_price
		}
	})

	
}
