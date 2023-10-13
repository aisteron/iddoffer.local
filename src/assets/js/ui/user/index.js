import { qs, xml } from "../../libs"
import { store, mode, close } from "./store"

export function User(){

	let icon = qs('.actions .user img')
	if(!icon) return

	predraw()
	
	store.subscribe(_=>{

		let state = store.getState()
		
		console.log(state)
		
		if(!state.open) {
			qs('.user_modal').classList.remove('open').innerHTML = '';

			return}

			switch(state.mode){
				case 'auth':
					user.draw_auth()
					break;
				case 'reg':
					user.draw_reg()
					break;
				case 'forgot':
					user.draw_forgot()
					break;
				case 'logged':
					user.draw_logged()
					break;
				case 'repair':
					user.draw_repair()
					break;
			}

			user.listeners()	

	
	})
		

}

export const user = {
	async get_user(){ return await xml("get_current_user",null, '/api/user').then(r => JSON.parse(r))
	},
	async login(obj){

		// receive obj {username:"",password:""}

		let res = await xml("login",obj, '/api/user').then(r => JSON.parse(r));
		let inps = [qs('form.auth input[name="pswd"]'), qs('form.auth input[name="email"]')];

		if(!res.success){
			inps.forEach(i => i.classList.add('error'))
			qs('form.auth input[name="pswd"]').nextElementSibling.innerHTML = res.message
		} else {
			let obj = {
				mode: "logged",
				username: res.username
			}
			store.dispatch(mode(obj))
		}


	},
	async repair_forgot(email){
		await xml("repair_password",{email:email},"/api/user")
		store.dispatch(mode({mode:"repair"}))

	},
	draw_auth(){
		let str = `
			<form class="auth">

				<label>
					<input type="text" required name="email" placeholder="Email">
					<span class="error"></span>
				</label>

				<label>
					<input type="password" required name="pswd" placeholder="Password">
					<span class="error"></span>
				</label>

				<div class="buttons">
					<button class="transparent reg" type="button">
						Регистрация
					</button>
					<button class="regular" type="submit">
						Войти
					</button>
				</div>

				<div class="forgot">
					<span>Забыли пароль?</span>
				</div>

			</form>
		`
		qs('.user_modal').innerHTML = str
	},
	draw_reg(){
		let mode = store.getState().mode
		let str = `
			<form class="reg">

				<label>
					<input type="text" required name="email" placeholder="Email">
					<span class="error"></span>
				</label>

				<label>
					<input type="password" required name="pswd" placeholder="Password">
					<span class="error"></span>
				</label>

				<label>
					<input type="password" required name="repeat_pswd" placeholder="Repeat password">
					<span class="error"></span>
				</label>

				<div class="buttons">
					<button class="regular" type="submit">
						Регистрация
					</button>
					<button class="transparent" type="button">
						Войти
					</button>
				</div>


			</form>
		`
		qs('.user_modal').innerHTML = str
		

	},
	draw_forgot(){
		let str = `
			<form class="forgot">
				<label>
					<input type="text" required name="email" placeholder="Email">
					<span class="error"></span>
				</label>
				<div class="buttons">
					<button class="regular" type="submit">
						Отправить пароль на почту
					</button>
					<button class="transparent back" type="button">
						Назад
					</button>
				</div>	

			</form>`
		qs('.user_modal').innerHTML = str	
	},
	draw_logged(){
		let state = store.getState()
		let str = `
			<form class="logged">
				<span class="username">Вы вошли как ${state.username}</span>

				<div class="buttons">
					<button class="regular" type="button">
						Кабинет
					</button>
					<button class="transparent" type="button">
						Выйти
					</button>
				</div>
			</form>
				`
		qs('.user_modal').innerHTML = str
	},

	draw_repair(){
		let str = `
			<p>Если пользователь с такой почтой существует, ему будет отправлено письмо с ссылкой на восстановление пароля</p>
			<button class="regular" type="button">Закрыть</button>
		`
		qs('.user_modal').innerHTML = str
	},

	listeners(){

		let state = store.getState()
		
		if(state.mode == 'auth'){

			qs('button.reg').addEventListener("click", event => {
				event.preventDefault();
				store.dispatch(mode({mode:"reg"}))
			})
			

			qs('form.auth').addEventListener("submit", async event => {
				event.preventDefault()
				let obj = {
					username: qs('form.auth input[name="email"]').value,
					password: qs('form.auth input[name="pswd"]').value,
				}
				this.login(obj)
			})

			qs('.forgot span').addEventListener("click", _ =>
			store.dispatch(mode({mode:"forgot"})))
		}

		if(state.mode == "reg"){
			qs('.buttons .transparent').addEventListener("click", _ =>{
				store.dispatch(mode({mode:"auth"}))
			})
			qs('form.reg').addEventListener("sumbit", event => {
				event.preventDefault()
				console.log(0)
			})
		}

		if(state.mode == "logged"){

			qs('.buttons .regular').addEventListener("click", event => {

				let ext = ".html"
				process.env.NODE_ENV == 'development'
				? ext = "html"
				: ext = ""

				let page = `/lk.${ext}`;

				location.href = page
			})

			qs('.buttons .transparent').addEventListener("click", event => {
				xml("logout", null, "/api/user")
				store.dispatch(mode({mode:"auth", username: null}))
			})

		}

		if(state.mode == "forgot"){
			qs('form.forgot button.back').addEventListener("click", _ => 
			store.dispatch(mode({mode:"auth"})))

			qs('form.forgot').addEventListener("submit", event => {
				event.preventDefault()
				
				this.repair_forgot(qs('input', event.target).value)
			})
		}
		if(state.mode == 'repair'){
			qs('.user_modal.open button').addEventListener("click", _ =>
			store.dispatch(close()))
		}

	}
}

async function predraw(){
	let icon = qs('.actions .user img')	
	icon.insertAdjacentHTML('afterend',`<div class="user_modal"></div>`)

	let u = await user.get_user()
	
	u.username == null
	? store.dispatch(mode({mode:"auth"}))
	: store.dispatch(mode({mode:"logged", user: u.username}))

	icon.addEventListener("click", _ => qs('.user_modal').classList.toggle('open'))

}