// слайдер на главной и стр. подкатегории
import {qs, qsa,loadCSS, onloadCSS} from '../../libs';

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

export const sw = {
	async load(){
		
		return new Promise(resolve =>{
			if(qs(['swiper'])){resolve(true); return}
			let script = document.createElement("script")
			script.src="/vendors/swiper/swiper-bundle.min.js"
			script.setAttribute("swiper","")
			qs(".scripts-area").appendChild(script)
			
			script.onload = () => {
				
				let style = loadCSS("/vendors/swiper/swiper-bundle.min.css")
				onloadCSS(style, () => {
					console.log('%c Swiper loaded', 'color: #666')
					resolve(true)
				})
			}
		})
	},

	init(el,options){
		
		new Swiper(el, options);
  
	}
}

async function custom_lazy(el){
	qsa("img[data-src]", el).forEach(el => {
		el.src = el.dataset.src
	})
}