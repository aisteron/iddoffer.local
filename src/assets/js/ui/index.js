import { aside } from "./components/aside";
import { HeadSlider } from "./components/head-slider";
import { map } from "./components/map";
import { partners_slider } from "./components/partners-slider";
import { reviews_slider } from "./components/reviews-slider";
import { sort } from "./components/sort";
import { Filter } from "./filter";

export function Ui(){
	HeadSlider()
	Filter()
	aside()
	sort()
	reviews_slider()
	partners_slider()
	map()
}