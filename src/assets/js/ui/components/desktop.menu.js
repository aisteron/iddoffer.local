import { doc, qs, qsa, xml } from "../../libs";

export async function desktop_menu(){

	dropdown_menu()
	

	// header currency dropdown

	await currency()

	currency_show()
	


	let current = localStorage.getItem('cur')
	if(!current) return
	current = JSON.parse(current).filter(el => el.current)
	if(!current.length) return
	if(current[0].current == "BYN") return

	replace_currency(current[0].current)
	
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

function replace_currency(current){
	// !current
	// &&

	let cur = JSON.parse(localStorage.getItem('cur'))
	
	qsa('[byn]').forEach(el =>{
		
		let byn = +el.getAttribute('byn')
		
		switch(current){
			case 'BYN':
				el.innerHTML = byn;
				break;
			case 'USD':
			case 'EUR':	
				let value = cur.filter(el => el.key == current)[0].value
				el.innerHTML = (byn / value).toFixed(2)

		}
	})

	qsa('span.cur').forEach(el => el.innerHTML = current)
}