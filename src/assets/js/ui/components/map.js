import { qs, xml } from "../../libs";

let addr = ""

export async function map(){
	addr = await xml("get_map",null,"/api/")

	footer_map()
	contacts_map()
	
}

function load_map(){
	qs("section.map").classList.remove("loading")
	qs("section.map span").remove()
	
	let script = document.createElement("script")
	script.src = addr
	qs("section.map").appendChild(script)
}

function footer_map(){
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

function contacts_map(){
	if(!qs("section#contacts .map")) return
	
	let script = document.createElement("script")
	script.src = addr
	qs("section#contacts .map span").remove()
	qs("section#contacts .map").appendChild(script)
}