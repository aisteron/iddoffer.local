import { qs } from "../../libs";

export function map(){
	if(!qs("section.map")) return

	let mp = qs("section.map")
	let once = false

	let observer = new IntersectionObserver((entries) => {
		(entries[0].isIntersecting && !once)
		&& (load_map(), once = true)
	}, 
	{ threshold: 0.4 } )

	observer.observe(mp)
}

function load_map(){
	qs("section.map").classList.remove("loading")
	qs("section.map span").remove()
	
	let script = document.createElement("script")
	script.src = "https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3A7ae8dedd5cb95038381d129ba15b1f89022ffc9059c1e4e0a279019742a69d95&amp;width=100&amp;lang=ru_RU&amp;scroll=true"
	qs("section.map").appendChild(script)
}