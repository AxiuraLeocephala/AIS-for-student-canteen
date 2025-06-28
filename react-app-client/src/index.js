import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from './components/errorPage.jsx';
import Preloader from './components/preloader.jsx';
import { LoaderMenu } from './services/loaderMenu';
import { LoaderBusket } from './services/loaderBusket';
import { LoaderOrder } from './services/loaderOrder';
import { AuthWrapper } from './services/authWrapper';
import { getCookie } from './utils/cookie.js';

const Menu = lazy(() => import('./pages/Menu.js'));
const Busket = lazy(() => import('./pages/Busket.js'));
const Order = lazy(() => import('./pages/Order.js'));

const router = createBrowserRouter(
    [
        {   
            path: "/menu",
            element: <Menu/>,
            errorElement: <ErrorPage/>,
            loader: async () => {
                if (!getCookie('accessToken') && !getCookie('refreshToken')) await AuthWrapper()
                return LoaderMenu();
            }
        }, {
            path: "/basket",
            element: <Busket/>,
            errorElement: <ErrorPage/>,
            loader: async () => {
                if (!getCookie('accessToken') && !getCookie('refreshToken')) await AuthWrapper()
                return LoaderBusket();
            }
        }, {
            path: "/order",
            element: <Order/>,
            errorElement: <ErrorPage/>,
            loader: async () => {
                if (!getCookie('accessToken') && !getCookie('refreshToken')) await AuthWrapper()
                return LoaderOrder();
            }
        }
    ]
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RouterProvider router={router} fallbackElement={<Preloader/>}/>
    </React.StrictMode>
);