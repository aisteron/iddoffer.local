import { qs } from './assets/js/libs';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './assets/js/lk/app.jsx';



if(qs('.lk-page')){
	const root = createRoot(qs('#root'));
	root.render(<App />);
	
}

