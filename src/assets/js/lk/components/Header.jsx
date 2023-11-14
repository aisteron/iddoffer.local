import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { user_exit } from "../store";
import { load_toast, xml } from "../../libs";
import { useLocation, Link } from "react-router-dom";

export const Header = () => {
	const user = useSelector(state => state.data)
	const dispatch = useDispatch()

	if(!user?.username) return

	const exit = () => {
		localStorage.removeItem('access_token')
		dispatch(user_exit())
	}


	
	return(
		<div id="header">
			<BackToUsersList />
			<SaveButton />
			<a href="/" className="tohome">На сайт</a>
			<span className="exit" onClick={_=>exit()}>Выйти</span>
			<img src="/assets/img/icons/user.svg" />
		</div>
	)
}

const SaveButton = () => {

	const user = useSelector(state => state.data)
	let access_token = localStorage.getItem('access_token')

	const save = async () => {
		let res = await xml('user_rename', {name: user.fullname, access_token: access_token}, '/api/user')
		res = JSON.parse(res)
		let message = res.success ? 'Успешно сохранено': res.message
		await load_toast().then(_ => new Snackbar(message))
		
	}
	

	return(
		<div className="save">
			<button className="save" onClick={_=>save()}>Сохранить</button>
		</div>
	)
}

const BackToUsersList = ()=> {
	const mode = useSelector(state => state.mode)
	const location = useLocation();
	if(mode !== 'admin') return
	

  useEffect(() => {
    //console.log('Location changed', location);
  }, [location]);

	if(!location.pathname.includes('users')) return

	return(
		<Link to={'/lk.html'} >
			<span>К списку</span>
		</Link>
	)
}