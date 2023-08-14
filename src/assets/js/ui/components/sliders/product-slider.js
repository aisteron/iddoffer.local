import { qs, sw } from "../../../libs"
export let swiper = {}
export async function product_slider(){
	if(!qs('body.prod-page')) return
	if(!qs('.swiper.thumbs')) { console.log('%c На странице не найден слайдер!', "color: #666");return}
	
	await sw.load()
	//console.log(window.innerWidth)
	//console.log(get_direction())

	let thumbs_slider_options = {
		spaceBetween: 10,
		//slidesPerView: screen.width <= 1160 ? 4 : 5,
		slidesPerView: 3,
		freeMode: true,
		watchSlidesProgress: true,
		direction: screen.width >= 1160 ? "vertical" : "horizontal",
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
	}

	let thumbsSwiper = new Swiper(qs('.swiper.thumbs'), thumbs_slider_options) 

	let main_slider_options = {
		spaceBetween: 10,
		thumbs:{
			swiper: thumbsSwiper
		}
	}

	swiper = new Swiper(qs('.swiper.main'), main_slider_options)

}

