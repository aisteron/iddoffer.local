import React, { useRef, useState } from "react";
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
			<FormRepairEmailSended />
			<FormActivated />
			<FormExpiredActivation />
			<FormInvalidToken/>
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
			username: qs('input[type="text"]', e.target).value,
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
			<input type="text" placeholder="E-mail" required defaultValue="iddoffer"/>
			<input type="password" placeholder="Password" required defaultValue="po106714"/>
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
	const pswd_input = useRef()
	const r_pswd_input = useRef()
	const [error, setError] = useState(null)
	if(mode !== 'reg') return

	const reg = e => {
		e.preventDefault()
		console.log(0)

	}

	const check = () => {
		pswd_input.current.value !== r_pswd_input.current.value
		? setError("Пароли отличаются")
		: setError(null)
	}
	
	return(
		<>
		<h3>Регистрация</h3>
		<form className="auth" onSubmit={e => reg(e)}>
			<input type="text" placeholder="E-mail" required/>
			<input type="password" placeholder="Password" required ref={pswd_input} onBlur={_=>check()} onKeyUp={_=>check()}/>
			<input type="password" placeholder="Repeat password" required ref={r_pswd_input} onBlur={_=>check()}/>
			<input type="submit" value="Submit" disabled={error ? 'disabled' : false}/>
			<span className="error">{error}</span>
		</form>
		<p onClick={()=> dispatch(set_mode("auth"))} className="create">Уже зареганы? Авторизоваться</p>
		</>
	)
}
export const FormRepair = () => {
	const mode = useSelector(state => state.mode)
	const dispatch = useDispatch()

	const repair = async e => {
		e.preventDefault()
		await xml("repair_password",{email: qs('[type="email"]',e.target).value},'/api/user')
		dispatch(set_mode("repair_email_sended"))
	}
	
	if(mode !== 'repair') return
	return(
		<>
		<h3>Восстановление пароля</h3>
		<form className="repair" onSubmit={e=>repair(e)}>
			<input type="email" placeholder="E-mail" required/>
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

const FormRepairEmailSended = () => {
	const mode = useSelector(state => state.mode)
	if(mode !== "repair_email_sended") return

	return(
		<div className="expired">
			<h3>Письмо с восстановлением пароля отправлено</h3>
			<p>Если пользователь с таким адресом будет найден, к нему придет письмо с восстановлением пароля</p>
		</div>
	)
}

const FormActivated = () => {
	const mode = useSelector(state => state.mode)
	const dispatch = useDispatch()
	if(mode !== "activated") return

	return(
		<div className="activated">
			<h3>Профиль активирован</h3>
			<p>Для авторизации кликните <span onClick={_ => {
					window.history.replaceState(null, '', window.location.pathname)
					dispatch(set_mode("auth"))
					}} className="link">сюда</span></p>
		</div>
	)
}

const FormExpiredActivation = () => {
	const mode = useSelector(state => state.mode)
	
	if(mode !== "expired_activation") return

	return(
		<div className="expired_activation">
			<h3>Срок действия ссылки истек</h3>
			<p>Больше по этой ссылке нельзя активировать пользователя</p>
		</div>
	)
}

const FormInvalidToken = () => {
	const dispatch = useDispatch()
	const mode = useSelector(state => state.mode)
	
	if(mode !== "invalid_token") return

	return(
		<div className="invalid_token">
			<h3>Ошибка проверки токена</h3>
			<p>Invalid token</p>
			<p>(токен не найден)</p>
			<p>Для авторизации кликните <span onClick={_ => {
					window.history.replaceState(null, '', window.location.pathname)
					dispatch(set_mode("auth"))
					}} className="link">сюда</span></p>
		</div>
	)
}

