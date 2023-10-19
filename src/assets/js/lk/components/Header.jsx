import React from "react"
import { useSelector } from "react-redux"

export const Header = () => {
	const user = useSelector(state => state.data)
	const mode = useSelector(state => state.mode)
	
	if(!user?.username) return
	
	return(
		<div id="header">
			<SaveButton />
			<a href="/" className="tohome">На сайт</a>
			<span className="exit">Выйти</span>
			<img src="/assets/img/icons/user.svg" />
		</div>
	)
}

const SaveButton = () => {
	return(
		<div className="save">
			<button className="save">Сохранить</button>
		</div>
	)
}