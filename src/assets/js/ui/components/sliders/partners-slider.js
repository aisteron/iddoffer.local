import { qs,sw } from "../../../libs";

export async function partners_slider(){

	if(!qs('section.partners')) return

	await sw.load()

	let partners_slider_options = {
			slidesPerView: 9,
      spaceBetween: 30,
      navigation: {
				nextEl: "section.partners .swiper-button-next",
				prevEl: "section.partners .swiper-button-prev",
			},
	}

	sw.init(qs('section.partners .swiper'), partners_slider_options)

}