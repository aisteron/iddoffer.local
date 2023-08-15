import { load_tippy, xml,qs } from "../libs"


export function Cart(){
	if(!qs('.cart-page')) return

	cart.get_order()
}

export const cart = {
	async add(els){
		
		await load_tippy()
		
		els.forEach(el => {
			el.addEventListener("click", async (event) => {
				let prodid = undefined
				
				event.target.nodeName == 'IMG' // subcat page
				&& (prodid = +event.target.closest('[data-prodid]').dataset.prodid)

				event.target.nodeName == 'BUTTON' // prod page
				&& (prodid = +qs('[resid]').getAttribute('resid'))

				let res = await xml('add_to_cart', {id: prodid}, '/api/cart')
				res = JSON.parse(res)
				
				const instance = tippy(event.target,{
					content: `Товар в корзине`,
					placement: "bottom",
					animation: 'fade',
			 	});
		 
			 
				instance.show();
				event.target.classList.add('incart')
				event.target.nodeName == 'BUTTON'
				&& (event.target.innerHTML = 'В корзине')
				
				//setTimeout(()=>{instance.destroy()},2000)

			})
		})
	},

	async get_order(){
		await xml('get_order',null,'/api/cart')
	}
	
}