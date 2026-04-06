import '../styles/globals.css';
import Navbar from './components/Navbar';
import { CartProvider } from '../contexts/CartContext';
import { SearchProvider } from '../contexts/SearchContext';

function MyApp({ Component, pageProps }) {
  return (
    <SearchProvider>
      <CartProvider>
        <Navbar />
        <Component {...pageProps} />
      </CartProvider>
    </SearchProvider>
  );
}

export default MyApp
