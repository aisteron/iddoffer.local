import React from "react"
import { Routes, Route, Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"
import { admin_update_user_page, } from "../store";
import { load_toast, xml } from "../../libs";

export const AdminForm = () => {
	const mode = useSelector(state => state.mode)
	const users = useSelector(state => state?.data?.users)
	
	if(mode !== 'admin') return

	return(
		<Routes>
			<Route path="/lk.html" element={<Table users={users}/>}></Route>
			<Route path="/users/:id" element={<User/>} />
		</Routes>
	)
}

const Table = ({users}) => {
	const dispatch = useDispatch()
	
	const change = async (e, userid, type) => {
		
		let u = users.filter(u => u.id == userid)[0]
		let val = e.target.value == 'да' ? true : e.target.value == 'нет' ? false : +e.target.value

		u = {...u, [type]: val}

		dispatch(admin_update_user_page(u))

		let token = localStorage.getItem('access_token')
		
		let resp = await xml(
			'admin_save_user', 
			{user:u, access_token:token}, 
			'/api/user').then(r => JSON.parse(r))
		
			await load_toast()
			new Snackbar(resp.success ? 'Успешно сохранено': resp.message)
		

		
	}

	
	return(
		<div id="admin_area">
			<ul className="header">
				<li>Почта</li>
				<li>Документы аппрувлены</li>
				<li>Размеры скидки, %</li>
				<li>Заблокирован</li>
			</ul>
			<ul className="body">
				{users.map(u => {

					return (
						<li key={u.id}>

								<Link to={'/users/' + u.id}>
									<span>{u.email}</span>
								</Link>

								<select
									defaultValue={u.approved ? 'да': 'нет'}
									onChange={e => change(e, u.id, 'approved')}>
										<option> да</option>
										<option> нет</option>
								</select>

								<input type="number"
									defaultValue={u.discount} min="1" max="100"
									onChange={e => change(e, u.id, 'discount')}/>

								<select
								defaultValue={u.blocked ? 'да': 'нет'}
								onChange={e => change(e, u.id, 'blocked')}>
									<option> да</option>
									<option> нет</option>
								</select>
						</li>
					)	
				})}
			</ul>
		</div>
	)
}

const User = () => {
	
	const {id} = useParams();
	const users = useSelector(state => state?.data?.users)
	let u = users.filter(u => u.id == id)[0]
	const dispatch = useDispatch()

	const save = (e, type) => {

		switch(type){
			case 'discount':
				u = {...u, [type]: +e.target.value}
				break;
			case 'approved':
			case 'blocked':
				u = {...u, [type]: e.target.checked}
				break;
		}
		dispatch(admin_update_user_page(u))

		
	}
	
	return(
		<div className="user_area">
			<input type="text" defaultValue={u.email} disabled/>
			
			<label>
				<input type="number"
					min="1"
					max="100" 
					defaultValue={u.discount}
					onChange={e => save(e,'discount')}/>
				<span> % скидки</span>
			</label>

			{<UserFiles user={u}/>}

			<label>
				<input type="checkbox"
				defaultChecked={u.approved}
				onChange={e => save(e,'approved')}
				/>
				<span>Документы аппрувлены</span>
			</label>

			<label>
				<input type="checkbox"
					defaultChecked={u.blocked}
					onChange={e => save(e,'blocked')}
				/>
				<span>Заблокирован</span>
			</label>
		</div>
	)
}

const UserFiles = ({user}) => {
	const dispatch = useDispatch()
	if(!user.files.length) return <span>Документы не загружены</span>

	const remove = name =>{

		let fls = user.files.filter(f => f.name !== name)
		let u = {...user, files: fls}
		dispatch(admin_update_user_page(u))
	}

	return(
		<ul className="files">
			{user.files.map(f => {
				return(
					<li key={f.path}>
						<a href={f.path} target="_blank" >{f.name}</a>
						<img src="/assets/img/icons/close_file.svg"
							className="remove"
							onClick = {_=>remove(f.name)}/>
					</li>
				)
			})}
		</ul>
	)
}


// работа со списком пользователей