import { useEffect } from 'react';
import { Router, Location, Redirect } from '@reach/router';
import { } from 'stylis-plugin-rtl';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Presale from './pages/App/presale';
import Admin from './pages/App/admin';
import ScrollToTopBtn from './components/menu/ScrollToTop';
import { SingingWeb3Provider } from './context/web3Context';

const PosedRouter = ({ children }) => (
  <Location>
    {({ location }) => (
      <div id='routerhang'>
        <div key={location.key}>
          <Router location={location}>
            {children}
          </Router>
        </div>
      </div>
    )}
  </Location>
);


export const ScrollTop = ({ children, location }) => {
  useEffect(() => window.scrollTo(0, 0), [location])
  return children
}

function App() {
  return (
    <div className='app'>
      <SingingWeb3Provider>
        <PosedRouter>
          <ScrollTop path="/">
            <Presale path="/" />
            <Admin path="/admin" />
          </ScrollTop>
        </PosedRouter>
      </SingingWeb3Provider>
      <ScrollToTopBtn />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
      />
    </div>
  );
}

export default App;
