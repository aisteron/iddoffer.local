import React from "react"
import { Routes, Route, Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux"

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

const Table = (users) => {
	
	return(
		<div id="admin_area">
			<ul className="header">
				<li>Почта</li>
				<li>Документы аппрувлены</li>
				<li>Размеры скидки, %</li>
				<li>Заблокирован</li>
			</ul>
			<ul className="body">
				{users.users.map(u => {

					return(
						<li key={u.id}>
								<Link to={'/users/' + u.id} >
									<span>{u.email}</span>
								</Link>

								<select>
									<option defaultValue={u.approved}> да</option>
									<option > нет</option>
								</select>

								<input type="number" defaultValue={u.discount} min="1" max="100"/>

								<select>
									<option defaultValue={u.blocked}> да</option>
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

	
	return(
		<div className="user_area">
			<input type="text" defaultValue={u.email} disabled/>
			
			<label>
				<input type="text" defaultValue={u.discount}/>
				<span> % скидки</span>
			</label>

			<UserFiles files={u.files}/>

			<label>
				<input type="checkbox" defaultChecked={u.approved}/>
				<span>Документы аппрувлены</span>
			</label>

			<label>
			<input type="checkbox" defaultChecked={u.blocked}/>
				<span>Заблокирован</span>
			</label>
		</div>
	)
}

const UserFiles = ({files}) => {
	if(!files.length) return <p>Документы не загружены</p>

	const remove = () =>{
		console.log('remove')
	}

	return(
		<ul className="files">
			{files.map(f => {
				return(
					<li key={f.path}>
						<a href={f.path} target="_blank" >{f.name}</a>
						<img src="/assets/img/icons/close_file.svg" className="remove" onClick = {_=>remove()}/>
					</li>
				)
			})}
		</ul>
	)
}