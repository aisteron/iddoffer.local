import { qs, sw } from "../../../libs"
export async function product_slider(){
	if(!qs('body.prod-page')) return
	if(!qs('.swiper.thumbs')) { console.log('%c На странице не найден слайдер!', "color: #666");return}
	
	await sw.load()
	console.log(window.innerWidth)
	console.log(get_direction())

	let thumbs_slider_options = {
		spaceBetween: 10,
		slidesPerView: get_slides_count(),
		freeMode: true,
		watchSlidesProgress: true,
		direction: get_direction(),
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

function get_direction(){
	let w = screen.width
	if(w >= 1160) return "vertical"

	return "horizontal"
}

function get_slides_count(){
	let w = screen.width
	if(w <= 1160) return 4

	return 5
}	