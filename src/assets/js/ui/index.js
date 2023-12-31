import { aside } from "./components/aside";
import { map } from "./components/map";
import { Filter } from "./filter";

import { head_slider } from "./components/sliders/head-slider";
import { partners_slider } from "./components/sliders/partners-slider";
import { product_slider } from "./components/sliders/product-slider";
import { reviews_slider } from "./components/sliders/reviews-slider";
import { subcat_slider } from "./components/sliders/subcat-slider";
import { default_slider } from "./components/sliders/default-slider";
import { mobile_menu } from "./components/mobile.menu";
import { desktop_menu } from "./components/desktop.menu";
import { ready_slider } from "./components/sliders/ready-slider";
import { User } from "./user/index.js";

export function Ui(){

	Filter()
	aside()

	map()
	mobile_menu()
	desktop_menu()
	
	head_slider()
	reviews_slider()
	partners_slider()
	product_slider()
	subcat_slider()
	default_slider()
	ready_slider()

	User()
}