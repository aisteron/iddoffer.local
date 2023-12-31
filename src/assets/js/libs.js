import "regenerator-runtime/runtime.js";
Node.prototype.listen = Node.prototype.addEventListener;
export const cfg = {
	//prefix: process.env.NODE_ENV == 'development' ? "dev." : "",
	prefix: ""
}
cfg.host = "https://"+cfg.prefix+"iddoffer.by"

export let doc=document,
qsa=(s,o=doc)=>o?.querySelectorAll(s),
qs=(s,o=doc)=>o?.querySelector(s);

export function loadCSS(n,e,o,d){"use strict";var t=window.document.createElement("link"),i=e||window.document.getElementsByTagName("script")[0],l=window.document.styleSheets;return t.rel="stylesheet",t.href=n,t.media="only x",d&&(t.onload=d),i.parentNode.insertBefore(t,i),t.onloadcssdefined=function(n){for(var e,o=0;o<l.length;o++)l[o].href&&l[o].href===t.href&&(e=!0);e?n():setTimeout(function(){t.onloadcssdefined(n)})},t.onloadcssdefined(function(){t.media=o||"all"}),t}

export function onloadCSS(n,e){
	n.onload=function(){
		n.onload=null,e&&e.call(n)
	},"isApplicationInstalled"in navigator&&"onloadcssdefined"in n&&n.onloadcssdefined(e);
}

export async function load_toast(){

	// https://github.com/joostlawerman/SnackbarLightjs

	// new Snackbar("Hey! Im a snackbar");

	return new Promise(resolve => {
		let script = document.createElement('script')
		script.src = '/vendors/snackbar/snackbarlight.min.js'
		qs('.scripts-area').appendChild(script)
		script.onload = () => {
			let style = loadCSS('/vendors/snackbar/snackbarlight.min.css')
			onloadCSS(style, () => {
				resolve('toast assets loaded')
			})
		}
	})
}

export async function load_tippy(){
  // https://atomiks.github.io/tippyjs/v5/methods/
  return new Promise(resolve => {
    if(qs(["tippy"])) {resolve(true); return}
    
    let script = document.createElement("script")
    script.src="/vendors/tippy/popper.min.js"
    script.setAttribute("tippy","")
    qs(".scripts-area").appendChild(script)
    
    script.onload = () => {
      let script = document.createElement("script")
      script.src="/vendors/tippy/tippy-bundle.umd.min.js"
      qs(".scripts-area").appendChild(script)
      script.onload = () => resolve(true)
    }
  })
}

export async function xml(action, data, path){
  
  data && (data = JSON.stringify(data))


  return new Promise(resolve => {

		let xhr = new XMLHttpRequest();
		let body = `action=${action}${data ? `&data=`+data : ""}`


		xhr.open("POST", cfg.host+path, true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

		xhr.onreadystatechange = function () {

			if (this.readyState != 4) return
			resolve(this.responseText)
		}

		xhr.send(body);
	})
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

// https://gist.github.com/ionurboz/51b505ee3281cd713747b4a84d69f434

export function debounce(func, wait, immediate) {
	var timeout;
  
	return function() {

	  var context = this, args = arguments;
	  var callNow = immediate && !timeout;
	  clearTimeout(timeout);
	  timeout = setTimeout(function() {

		timeout = null;
  
		if (!immediate) {
			func.apply(context, args);
		}
	  }, wait);

	  if (callNow) func.apply(context, args);
	}
  }
	
	// https://gist.github.com/ShepetaAndrey/d3507a1ac72ff3544cdb734fd1a80178
	// const result = declension(10, ['монета', 'монеты', 'монет'])
  // console.log(result) // 'монет'

	export function declension(number, declensions, cases = [2, 0, 1, 1, 1, 2]) {
		return declensions[
			number % 100 > 4 && number % 100 < 20
				? 2
				: cases[number % 10 < 5 ? number % 10 : 5]
		];
	}