import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { qs, xml } from "../../libs";
import { set_current_user, store } from "../store";

export const Form = () => {
	const user = useSelector(state => state.data)
	const[mode, setMode] = useState("auth")
	if(user == undefined) return
	if(user.username !== null) return 
	let form;
	switch(mode){
		case "auth":
			form = <FormAuth setMode={setMode}/>
			break;
		case "reg":
			form = <FormReg setMode={setMode}/>
			break;
		case "repair":
			form = <FormRepair setMode={setMode}/>	
			break;
	}
	return form;
	
}

export const FormAuth = ({setMode}) => {
	const dispatch = useDispatch()
	const[error, setError] = useState()

	const submit_auth = (e) => {
		
		e.preventDefault()
		
		let obj = {
			username: qs('input[type="email"]', e.target).value,
			password: qs('input[type="password"]', e.target).value
		}

		xml("login", obj, "/api/user")
		.then(r => JSON.parse(r))
		.then(r => {

			!r.success
			? setError(r.message)
			: dispatch(set_current_user(r))
			
		})
		
	}
	
	return(
		<>
		<h3>Авторизация в личном кабинете</h3>
		<form className="auth" onSubmit={e=>submit_auth(e)}>
			<input type="email" placeholder="E-mail" required defaultValue="timotheus@list.ru"/>
			<input type="password" placeholder="Password" required defaultValue="12345678"/>
			<input type="submit" value="Submit"/>
			<span className="error">{error}</span>
		</form>
		<p onClick={()=> setMode("reg")} className="create">Нет аккаунта? Создать</p>
		<p onClick={()=> setMode("repair")} className="create">Восстановить пароль</p>
		</>
	)
}


export const FormReg = ({setMode}) => {
	return(
		<>
		<h3>Регистрация</h3>
		<form className="auth">
			<input type="email" placeholder="E-mail" />
			<input type="password" placeholder="Password" />
			<input type="password" placeholder="Repeat password" />
			<input type="submit" value="Submit"/>
			<span className="error"></span>
		</form>
		<p onClick={()=> setMode("auth")} className="create">Уже зареганы? Авторизоваться</p>
		</>
	)
}

export const FormRepair = ({setMode}) => {
	return(
		<>
		<h3>Восстановление пароля</h3>
		<form className="repair">
			<input type="email" placeholder="E-mail" />
			<input type="submit" value="Submit"/>
			<span className="error"></span>
		</form>
		<p onClick={()=> setMode("auth")} className="create">Назад</p>
		</>
	)
}