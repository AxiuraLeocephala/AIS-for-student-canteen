import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom';
import Authenticate from './components/authenticate/authenticate.jsx';
import ErrorElement from './error/ErrorElement.jsx';
import BaseStartupComponent from './components/adminpanel/baseStartupComponent.jsx';
import { getCookie } from './utils/cookie.js';
import { MainProvider } from './context/mainContext.js';
import "./style/App.css";

const router = createBrowserRouter(
	[
		{
			path: '/authenticate',
			element:
				<MainProvider>
					<Authenticate/>
				</MainProvider>,
			errorElement: <ErrorElement/>,
			loader: async () => {
				if (getCookie("accessTokenAdmin") && getCookie("refreshTokenAdmin")) {
					return redirect("/adminpanel")
				} else {
					return null;
				}
			}
		},
		{
			path: "/adminpanel",
			element: <BaseStartupComponent/>,
			errorElement: <ErrorElement/>,
			loader: async () => {
				const accessTokenAdmin = getCookie('accessTokenAdmin');
				const refreshTokenAdmin = getCookie('refreshTokenAdmin');

				if (!accessTokenAdmin && !refreshTokenAdmin) {
					return redirect("/authenticate")
				} else {
					return {accessTokenAdmin};
				}
			}
		}
	]
)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<RouterProvider router={router}/>
	</React.StrictMode>
);