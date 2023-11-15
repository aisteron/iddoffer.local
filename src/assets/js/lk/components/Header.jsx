import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { user_exit } from "../store";
import { load_toast, xml } from "../../libs";
import { useLocation, Link, useSearchParams } from "react-router-dom";

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
			<SaveButtonUserMode />
			<SaveButtonAdminMode />
			<a href="/" className="tohome">На сайт</a>
			<Link to="/lk.html" className="exit" onClick={_=>exit()}>Выйти</Link>
			<img src="/assets/img/icons/user.svg" />
		</div>
	)
}

const SaveButtonUserMode = () => {

	const user = useSelector(state => state.data)
	const mode = useSelector(state => state.mode)
	if(mode !== 'user') return

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
	if(!location.pathname.includes('users')) return

	return(
		<Link to={'/lk.html'} >
			<span>К списку</span>
		</Link>
	)
}

const SaveButtonAdminMode = () => {
	const mode = useSelector(state => state.mode)
	const users = useSelector(state => state.data.users)
	const location = useLocation();
	const selectedUserId = +location.pathname.split("/")[2]
	const [error, setError] = useState(null)
	if(mode !== 'admin') return
	if(!location.pathname.includes('users')) return

	const save = async () => {
		let u = users.filter(u => u.id == selectedUserId)[0]
		let token = localStorage.getItem('access_token')
		
		let resp = await xml(
			'admin_save_user', 
			{user:u, access_token:token}, 
			'/api/user')
			
			try {
				resp = JSON.parse(resp)
			} catch(e){
				setError("Ошибка сервера")
				setTimeout(()=>setError(null),2000)
			}
			
			if(!error){
				await load_toast()
				new Snackbar(resp.success ? 'Успешно сохранено': resp.message)

			}
	}
	


	return(
		<div className="save au">
			<button className="save" onClick={_=>save()}>Сохранить</button>
			<span className="error">{error}</span>
		</div>
	)
}