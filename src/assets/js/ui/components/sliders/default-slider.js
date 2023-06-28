import { qs,qsa,sw } from "../../../libs";

export async function default_slider(){

	if(!qs('.default-swiper')) return

	await sw.load()

	qsa(".swiper.default").forEach(el =>{
		
		let default_slider_options = {
			slidesPerView: get_slide_count(),
			spaceBetween: 18,
			navigation: {
				nextEl: qs(".swiper-button-next", el),
				prevEl: qs(".swiper-button-prev", el),
			},
		}

		sw.init(qs('.swiper.default'), default_slider_options)	
	})

	

}

function get_slide_count(){
	let w = screen.width
	if(w > 886) return 3
	if(w <= 886 & w >= 530) return 2
	if(w < 530) return 1
}