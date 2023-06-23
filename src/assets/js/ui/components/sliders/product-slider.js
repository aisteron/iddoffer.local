import { qs, sw } from "../../../libs"
export async function product_slider(){
	if(!qs('body.prod-page')) return
	if(!qs('.swiper.thumbs')) { console.log('%c На странице не найден слайдер!', "color: #666");return}
	
	await sw.load()

	let thumbs_slider_options = {
		spaceBetween: 10,
		slidesPerView: 4,
		freeMode: true,
		watchSlidesProgress: true,
		direction: "vertical",
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
	new Swiper(qs('.swiper.main'), main_slider_options)

}