import { qs, qsa, sw } from "../../../libs"
export let swiper = {}

export async function ready_slider(){

	if(!qs('body.ready-page')) return
	
	await sw.load()
 

	let main_slider_options = { spaceBetween: 16}

	swiper = new Swiper(qs('.swiper.main'), main_slider_options)

	thumbs(swiper)

}



function thumbs(swiper){

	let images = qsa('.thumbs img')

	swiper.on('slideChange', function(swiper){
		
		images.forEach((el,i) => {
			i !== swiper.snapIndex
			? el.classList.remove('active')
			: el.classList.add('active')
		})
	})

	images.forEach((el, i) => {
		el.addEventListener("click", _ => {
			swiper.slideTo(i)
		})
	})
}