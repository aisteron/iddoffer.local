import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'

import App from './assets/js/lk/app.jsx';
import {store} from './assets/js/lk/store'
import { qs } from './assets/js/libs';



if(qs('.lk-page')){
	const root = createRoot(qs('#root'));
	root.render(
		<Provider store={store}>
			<App />
		</Provider>
	)
}

