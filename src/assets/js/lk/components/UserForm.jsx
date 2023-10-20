import React, { useState } from "react"
import { useSelector } from "react-redux"

export const UserForm = () => {
	const user = useSelector(state => state.data)
	const [file, setFile] = useState(null)
	const [error, setError] = useState()
	if(!user?.username) return

	const handleFile = e => {

		let file = e.target.files[0]
		if((file.size / 1024 / 1024) > 5){
				setError("Файл больше 5 Мб")
		} else {
		setFile(file)
		}
	}

	const uploadFile = e => {

	}
	


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

			<input type="file" onChange={e=>handleFile(e)}/>
			{(file && !error) ? <button onClick={e=>uploadFile()}>Загрузить на сервер</button> : ''}
			
			<div className="comment">
				<p>Размер файла до 5 Мб</p>
				<p>Типы файлов: pdf, doc, docx, jpg</p>
			</div>
			


		</div>
	)
}