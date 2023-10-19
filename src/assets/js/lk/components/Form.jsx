import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { qs, xml } from "../../libs";
import { set_current_user, set_mode } from "../store";

export const Form = () => {

	return(
		<>
			<FormAuth/>
			<FormReg/>
			<FormRepair/>
			<FormReset />
			<FormExpired />
		</>
	)
	
}

export const FormAuth = () => {
	const mode = useSelector(state => state.mode)
	const dispatch = useDispatch()
	const[error, setError] = useState()
	if(mode !== 'auth') return

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
			<input type="password" placeholder="Password" required defaultValue="1"/>
			<input type="submit" value="Submit"/>
			<span className="error">{error}</span>
		</form>
		<p onClick={()=> dispatch(set_mode("reg"))} className="create">Нет аккаунта? Создать</p>
		<p onClick={()=> dispatch(set_mode("repair"))} className="create">Восстановить пароль</p>
		</>
	)
}
export const FormReg = () => {
	const mode = useSelector(state => state.mode)
	const dispatch = useDispatch()
	if(mode !== 'reg') return
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
		<p onClick={()=> dispatch(set_mode("auth"))} className="create">Уже зареганы? Авторизоваться</p>
		</>
	)
}
export const FormRepair = () => {
	const mode = useSelector(state => state.mode)
	const dispatch = useDispatch()
	
	if(mode !== 'repair') return
	return(
		<>
		<h3>Восстановление пароля</h3>
		<form className="repair">
			<input type="email" placeholder="E-mail" />
			<input type="submit" value="Submit"/>
			<span className="error"></span>
		</form>
		<p onClick={()=> dispatch(set_mode("auth"))} className="create">Назад</p>
		</>
	)
}
const FormReset = () => {
	
	const mode = useSelector(state => state.mode)
	const[error, setError] = useState()
	const[message, setMessage] = useState()
	const dispatch = useDispatch()

	const queryParameters = new URLSearchParams(window.location.search)
  const token = queryParameters.get("token")

	if(mode !== "reset") return

	const submit_reset = async e => {
		e.preventDefault()
		let pswd = qs('[name="pswd"]',e.target)
		let npswd = qs('[name="npswd"]',e.target)
		
		if(pswd.value !== npswd.value){
			setError('Пароли не совпадают')
			return;
		}

		let res = await xml("reset_password",{pswd: pswd.value, token: token}, "/api/user").then(r => JSON.parse(r))
		
		if(!res.success){
			setError(res.message)
			return
		} else {
			dispatch(set_current_user(res))
		}
		

	}
	
	return(
		<>
		<h3>Сброс пароля</h3>
		<form className="repair" onSubmit={e=>submit_reset(e)}>
			
			<input type="password" placeholder="Новый пароль" name="pswd"/>
			<input type="password" placeholder="Повторите новый пароль" name="npswd"/>
			<input type="submit" value="Submit"/>
			<span className="error">{error}</span>
			<span className="error">{message}</span>
		</form>
		
		</>
	)
}

const FormExpired = () => {
	const mode = useSelector(state => state.mode)
	const dispatch = useDispatch()
	
	if(mode !== "expired") return

	return(
		<div className="expired">
			<h3>Срок действия ссылки истек</h3>
			<p>Вы можете попытаться отправить письмо&nbsp;
				<span onClick={_ => {
					window.history.replaceState(null, '', window.location.pathname)
					dispatch(set_mode("repair"))
					}}>заново</span></p>
		</div>
	)
}