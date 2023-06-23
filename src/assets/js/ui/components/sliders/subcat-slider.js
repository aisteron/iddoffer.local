import { qs,sw } from "../../../libs";

export async function subcat_slider(){
	if(!qs('.swiper.subcat')) return
	await sw.load()

	let subcat_slider_options = {
		slidesPerView: 7,
		spaceBetween: 10,
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
	}

	sw.init(qs('.swiper.subcat'), subcat_slider_options)
}