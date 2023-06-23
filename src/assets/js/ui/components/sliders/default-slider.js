import { qs,qsa,sw } from "../../../libs";

export async function default_slider(){

	if(!qs('.default-swiper')) return

	await sw.load()

	qsa(".swiper.default").forEach(el =>{
		
		let default_slider_options = {
			slidesPerView: 3,
			spaceBetween: 18,
			navigation: {
				nextEl: qs(".swiper-button-next", el),
				prevEl: qs(".swiper-button-prev", el),
			},
		}

		sw.init(qs('.swiper.default'), default_slider_options)	
	})

	

}