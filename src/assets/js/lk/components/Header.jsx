import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { user_exit } from "../store";

export const Header = () => {
	const user = useSelector(state => state.data)
	const mode = useSelector(state => state.mode)
	const dispatch = useDispatch()

	if(!user?.username) return

	const exit = () => {
		localStorage.removeItem('access_token')

		dispatch(user_exit())
	}
	
	return(
		<div id="header">
			<SaveButton />
			<a href="/" className="tohome">На сайт</a>
			<span className="exit" onClick={_=>exit()}>Выйти</span>
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