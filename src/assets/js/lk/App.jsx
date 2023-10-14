import "./App.sass";
import React, { useEffect } from "react";
import { Header } from "./components/Header.jsx";
import { fetch_user_thunk, repair_password, store } from "./store";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "./components/Form.jsx";


export default function App() {

	const dispatch = useDispatch()
	
	store.subscribe(_ => console.log(store.getState()))

	const queryParameters = new URLSearchParams(window.location.search)
  const token = queryParameters.get("token")
	console.log(token)
	
	useEffect(()=>{
		token
		? dispatch(repair_password())
		: dispatch(fetch_user_thunk())
	},[])
	
	
	return (
		<>
			<Loader/>
			<Header/>
			<Form />
			<Repair></Repair>
		</>
  );
}


export const Loader = () => {

	const isLoading = useSelector(state => state.loading)
	return isLoading ? ('Загружается') : null

}

const Repair = () => {
	const repair = useSelector(state => state.repair)
	if(!repair) return
	
	return(
		<>
		<h3>Восстановление пароля</h3>
		<form className="repair">
			
			<input type="password" placeholder="Новый пароль" />
			<input type="password" placeholder="Повторите новый пароль" />
			<input type="submit" value="Submit"/>
			<span className="error"></span>
		</form>
		
		</>
	)
}