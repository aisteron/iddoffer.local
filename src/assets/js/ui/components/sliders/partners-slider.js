import { qs,sw } from "../../../libs";

export async function partners_slider(){

	if(!qs('section.partners')) return

	await sw.load()

	let partners_slider_options = {
			slidesPerView: get_count(),
      spaceBetween: 30,
      navigation: {
				nextEl: "section.partners .swiper-button-next",
				prevEl: "section.partners .swiper-button-prev",
			},
	}

	sw.init(qs('section.partners .swiper'), partners_slider_options)

}

function get_count(){
	let w = window.innerWidth
	if(w > 996) return 9
	if(w <= 996 && w > 530) return 5
	return 3
}