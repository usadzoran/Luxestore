import React from 'react';
  import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
  import { Navbar } from './components/Navbar';
  import { Footer } from './components/Footer';
  import { Home } from './pages/Home';
  import { Products } from './pages/Products';
  import { ProductDetail } from './pages/ProductDetail';
  import { Admin } from './pages/Admin';

  function App() {
    return (
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    );
  }

  export default App;
  
