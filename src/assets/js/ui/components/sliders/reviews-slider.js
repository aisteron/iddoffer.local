import { qs,sw } from "../../../libs";

export async function reviews_slider(){
	if(!qs('section.reviews')) return
	await sw.load()

	let reviews_slider_options = {
		pagination: {
			el: "section.reviews .swiper-pagination",
		},
	}

	sw.init(qs('section.reviews .swiper'), reviews_slider_options)
}