// слайдер на главной и стр. подкатегории
import {qs, qsa, sw} from '../../libs';

export async function HeadSlider(){
	if(!qs('#head-slider'))	return;

	await sw.load()
	await custom_lazy(qs('#head-slider'))

	let head_slider_options = {
		navigation: {
			nextEl: "#head-slider .swiper-button-next",
			prevEl: "#head-slider .swiper-button-prev",
		},
	}

	sw.init(qs('#head-slider'), head_slider_options)

}


async function custom_lazy(el){
	qsa("img[data-src]", el).forEach(el => {
		el.src = el.dataset.src
	})
}