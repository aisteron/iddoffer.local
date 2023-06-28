import { qs,sw } from "../../../libs";

export async function subcat_slider(){
	if(!qs('.swiper.subcat')) return
	await sw.load()

	let subcat_slider_options = {
		slidesPerView: get_slides_count(),
		spaceBetween: 10,
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
	}

	sw.init(qs('.swiper.subcat'), subcat_slider_options)
}

function get_slides_count(){
	let w = window.innerWidth
	if(w > 1530) return 7
	if(w > 1090 && w <= 1530) return 5
	if(w > 768 && w <= 1090) return 3
	if(w > 500 && w <= 768) return 2
	if(w <= 460 ) return 2
	
}