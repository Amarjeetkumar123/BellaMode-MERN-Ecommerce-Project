import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './routers/router.jsx'
import 'remixicon/fonts/remixicon.css'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'

// Photos fade in once they've loaded (styles in storefront.css). `load` doesn't bubble,
// so listen in the capture phase; a broken image is marked too so it never stays hidden.
const markLoaded = (e) => { if (e.target.tagName === 'IMG') e.target.classList.add('is-loaded'); };
document.addEventListener('load', markLoaded, true);
document.addEventListener('error', markLoaded, true);

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>,
)
