import { aside } from "./components/aside";
import { map } from "./components/map";
import { sort } from "./components/sort";
import { Filter } from "./filter";

import { head_slider } from "./components/sliders/head-slider";
import { partners_slider } from "./components/sliders/partners-slider";
import { product_slider } from "./components/sliders/product-slider";
import { reviews_slider } from "./components/sliders/reviews-slider";
import { subcat_slider } from "./components/sliders/subcat-slider";
import { default_slider } from "./components/sliders/default-slider";

export function Ui(){

	Filter()
	aside()
	sort()
	map()
	
	head_slider()
	reviews_slider()
	partners_slider()
	product_slider()
	subcat_slider()
	default_slider()
}