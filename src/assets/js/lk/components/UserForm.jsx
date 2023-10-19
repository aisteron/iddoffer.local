import React, { useState } from "react"
import { useSelector } from "react-redux"

export const UserForm = () => {
	const user = useSelector(state => state.data)
	const [file, setFile] = useState([])
	if(!user?.username) return
	


	return(
		<div className="userform">
			<input type="text" className="fullname" defaultValue={user.fullname}/>
			<input type="email" className="email" defaultValue={user.email} disabled/>
			
			<label>
				<input type="text" className="email" 
				defaultValue={user.discount ? user.discount: 'скидки нет'} disabled/>
				{user.discount ? <span className="percent">%</span> : ''}
			</label>

			<span className="status">
				<span>Статус:</span>
				{user.status == 'approved'
				? <span className="approved">Документы проверены</span>
				: <span className="not_approved">Документы не проверены</span>
			}
			</span>

			<ul className="files">
				{user.files ? JSON.parse(user.files).map((el,i) => {
					return(
						<li key={i}>
							<a href={el.path} download>{el.name}</a>
							<img src="/assets/img/icons/close_file.svg" className="remove"/>
						</li>)
				}): ''}
			</ul>

			<input type="file" />


		</div>
	)
}