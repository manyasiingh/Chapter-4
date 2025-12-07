import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Books from './pages/Books';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AuthProvider, { AuthContext } from './context/AuthContext';
import CartProvider from './context/CartContext';
import Cart from './pages/Cart';
import OrderSummaryPage from './pages/OrderSummaryPage';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import BookDetail from './pages/BookDetail';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './components/WishlistPage';
import Faq from './pages/Faq';
import Blog from './pages/Blog';
import StartupPopup from './components/StartupPopup';
import UserExperience from './pages/UserExperience';
import ExperienceList from './pages/ExperienceList';
import BookQuiz from './components/BookQuiz';
import QuizResults from './components/QuizResults';
import MonthlyQuiz from './components/MonthlyQuiz';
import SpinWheel from "./components/SpinWheel";
import RazorpayFakeModal from './pages/RazorpayFakeModal';

// admin
import AdminDashboard from './pages/AdminDashboard';
import AdminBookList from './components/AdminBookList';
import AdminAddEditBook from './components/AdminAddEditBook';
import AdminOrders from './components/AdminOrders';
import AdminOrderDetails from './components/AdminOrderDetails';
import AdminUsers from './components/AdminUsers';
import AdminUserDetails from './components/AdminUserDetails';
import AdminAddUser from './components/AdminAddUser';
import AdminFaq from './components/AdminFaq';
import SalesReport from './components/SalesReport';
import StockReport from './components/StockReport';
import EarningsReport from './components/EarningsReport';
import AdminExperiences from './components/AdminExperiences';
import AdminCoupons from './components/AdminCoupons';
import AddCoupon from './components/AddCoupon';
import EditCoupon from './components/EditCoupon';
import AdminChat from './components/AdminChat';
import AdminQuizAttempts from './components/AdminQuizAttempts';
import AdminSales from './components/AdminSales';
import SaleForm from './components/SaleForm';
import AdminReviews from './components/AdminReviews';
import AdminPopupList from './components/AdminPopupList';
import AdminPopupAdd from './components/AdminPopupAdd';
import AdminPopupEdit from './components/AdminPopupEdit';
import AdminAbout from './components/AdminAbout';
import AdminContactInfo from './components/AdminContactInfo';
import AdminContactQueries from './components/AdminContactQueries';

// admin spin
import AdminSpinRewards from './components/AdminSpinRewards';
import AdminSpinOptions from './components/AdminSpinOptions';

// live chat
import LiveChat from './components/LiveChat';

function AppContent() {
  const email = localStorage.getItem('email');
  const { user } = useContext(AuthContext);

  // GLOBAL PAYMENT MODAL STATE HERE
  const [paymentData, setPaymentData] = useState(null);

  const openPaymentModal = (data) => {
    setPaymentData(data);
  };

  const closePaymentModal = () => {
    setPaymentData(null);
  };

  const userId = user?.id || user?._id || 0;

  return (
    <CartProvider userEmail={user?.email}>
      <Router>
        <StartupPopup />
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/books" element={<Books />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-summary" element={<OrderSummaryPage />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/book/:id" element={<BookDetail />} />

          {/* 🔥 Checkout injects payment modal */}
          <Route 
            path="/checkout" 
            element={<CheckoutPage openPaymentModal={openPaymentModal} />} 
          />

          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/share-experience" element={<UserExperience />} />
          <Route path="/experiences" element={<ExperienceList />} />
          <Route path="/livechat" element={<LiveChat userEmail={user?.email} />} />
          <Route path="/book-quiz" element={<BookQuiz />} />
          <Route path="/quiz-results" element={<QuizResults />} />
          <Route path="/monthly-quiz" element={<MonthlyQuiz />} />

          {/* spin uses email */}
          <Route path="/spin" element={<SpinWheel userEmail={user?.email} />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/books" element={<AdminBookList />} />
          <Route path="/admin/books/add" element={<AdminAddEditBook />} />
          <Route path="/admin/books/edit/:id" element={<AdminAddEditBook />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:id" element={<AdminUserDetails />} />
          <Route path="/admin/users/add" element={<AdminAddUser />} />
          <Route path="/admin/questions" element={<AdminFaq />} />
          <Route path="/admin/sales-report" element={<SalesReport />} />
          <Route path="/admin/stock-report" element={<StockReport />} />
          <Route path="/admin/earnings-report" element={<EarningsReport />} />
          <Route path="/admin/experiences" element={<AdminExperiences />} />
          <Route path="/admin/coupons" element={<AdminCoupons />} />
          <Route path="/admin/coupons/add" element={<AddCoupon />} />
          <Route path="/admin/coupons/edit/:id" element={<EditCoupon />} />
          <Route path="/admin/chat" element={<AdminChat />} />
          <Route path="/admin/quiz-attempts" element={<AdminQuizAttempts />} />
          <Route path="/admin/sales" element={<AdminSales />} />
          <Route path="/admin/sales/add" element={<SaleForm />} />
          <Route path="/admin/sales/edit/:id" element={<SaleForm />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/popup-settings" element={<AdminPopupList />} />
          <Route path="/admin/popup-settings/add" element={<AdminPopupAdd />} />
          <Route path="/admin/popup-settings/edit/:id" element={<AdminPopupEdit />} />
          <Route path="/admin/about" element={<AdminAbout />} />
          <Route path="/admin/contactinfo" element={<AdminContactInfo />} />
          <Route path="/admin/contact-queries" element={<AdminContactQueries />} />
          <Route path="/admin/spin-rewards" element={<AdminSpinRewards />} />
          <Route path="/admin/spin-options" element={<AdminSpinOptions />} />
        </Routes>

        <Footer />

        {user?.role === 'User' && <LiveChat userEmail={email} />}

        {/* 🔥 GLOBAL PAYMENT MODAL (renders on top when opened) */}
        {paymentData && (
          <RazorpayFakeModal
            amount={paymentData.amount}
            method={paymentData.method}
            onSuccess={paymentData.onSuccess}
            onClose={closePaymentModal}
          />
        )}
      </Router>
    </CartProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;



// import React, { useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';
// import Home from './pages/Home';
// import About from './pages/About';
// import Contact from './pages/Contact';
// import Books from './pages/Books';
// import Signup from './pages/Signup';
// import Login from './pages/Login';
// import AuthProvider, { AuthContext } from './context/AuthContext';
// import CartProvider from './context/CartContext';
// import Cart from './pages/Cart';
// import OrderSummaryPage from './pages/OrderSummaryPage';
// import OrderHistory from './pages/OrderHistory';
// import Profile from './pages/Profile';
// import ForgotPassword from './pages/ForgotPassword';
// import BookDetail from './pages/BookDetail';
// import CheckoutPage from './pages/CheckoutPage';
// import WishlistPage from './components/WishlistPage';
// import Faq from './pages/Faq';
// import Blog from './pages/Blog';
// import StartupPopup from './components/StartupPopup';
// import UserExperience from './pages/UserExperience';
// import ExperienceList from './pages/ExperienceList';
// import BookQuiz from './components/BookQuiz';
// import QuizResults from './components/QuizResults';
// import MonthlyQuiz from './components/MonthlyQuiz';
// import SpinWheel from "./components/SpinWheel";
// import RazorpayFakeModal from './pages/RazorpayFakeModal';

// // admin
// import AdminDashboard from './pages/AdminDashboard';
// import AdminBookList from './components/AdminBookList';
// import AdminAddEditBook from './components/AdminAddEditBook';
// import AdminOrders from './components/AdminOrders';
// import AdminOrderDetails from './components/AdminOrderDetails';
// import AdminUsers from './components/AdminUsers';
// import AdminUserDetails from './components/AdminUserDetails';
// import AdminAddUser from './components/AdminAddUser';
// import AdminFaq from './components/AdminFaq';
// import SalesReport from './components/SalesReport';
// import StockReport from './components/StockReport';
// import EarningsReport from './components/EarningsReport';
// import AdminExperiences from './components/AdminExperiences';
// import AdminCoupons from './components/AdminCoupons';
// import AddCoupon from './components/AddCoupon';
// import EditCoupon from './components/EditCoupon';
// import AdminChat from './components/AdminChat';
// import AdminQuizAttempts from './components/AdminQuizAttempts';
// import AdminSales from './components/AdminSales';
// import SaleForm from './components/SaleForm';
// import AdminReviews from './components/AdminReviews';
// import AdminPopupList from './components/AdminPopupList';
// import AdminPopupAdd from './components/AdminPopupAdd';
// import AdminPopupEdit from './components/AdminPopupEdit';
// import AdminAbout from './components/AdminAbout';
// import AdminContactInfo from './components/AdminContactInfo';
// import AdminContactQueries from './components/AdminContactQueries';

// //admin spin
// import AdminSpinRewards from './components/AdminSpinRewards';
// import AdminSpinOptions from './components/AdminSpinOptions';

// // live chat
// import LiveChat from './components/LiveChat';

// function AppContent() {
//   const email = localStorage.getItem('email');
//   const { user } = useContext(AuthContext);

//   // userId stays because other components still need it
//   const userId = user?.id || user?._id || 0;

//   return (
//     <CartProvider userEmail={user?.email}>
//       <Router>
//         <StartupPopup />
//         <Navbar />
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/contact" element={<Contact />} />
//           <Route path="/books" element={<Books />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/cart" element={<Cart />} />
//           <Route path="/order-summary" element={<OrderSummaryPage />} />
//           <Route path="/order-history" element={<OrderHistory />} />
//           <Route path="/profile" element={<Profile />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/book/:id" element={<BookDetail />} />
//           <Route path="/checkout" element={<CheckoutPage />} />
//           <Route path="/wishlist" element={<WishlistPage />} />
//           <Route path="/faq" element={<Faq />} />
//           <Route path="/blog" element={<Blog />} />
//           <Route path="/share-experience" element={<UserExperience />} />
//           <Route path="/experiences" element={<ExperienceList />} />
//           <Route path="/livechat" element={<LiveChat userEmail={user?.email} />} />
//           <Route path="/book-quiz" element={<BookQuiz />} />
//           <Route path="/quiz-results" element={<QuizResults />} />
//           <Route path="/monthly-quiz" element={<MonthlyQuiz />} />

//           {/* 🔥 FINAL FIX — SPIN USES EMAIL */}
//           <Route path="/spin" element={<SpinWheel userEmail={user?.email} />} />

//           {/* Admin Routes */}
//           <Route path="/admin/dashboard" element={<AdminDashboard />} />
//           <Route path="/admin/books" element={<AdminBookList />} />
//           <Route path="/admin/books/add" element={<AdminAddEditBook />} />
//           <Route path="/admin/books/edit/:id" element={<AdminAddEditBook />} />
//           <Route path="/admin/orders" element={<AdminOrders />} />
//           <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
//           <Route path="/admin/users" element={<AdminUsers />} />
//           <Route path="/admin/users/:id" element={<AdminUserDetails />} />
//           <Route path="/admin/users/add" element={<AdminAddUser />} />
//           <Route path="/admin/questions" element={<AdminFaq />} />
//           <Route path="/admin/sales-report" element={<SalesReport />} />
//           <Route path="/admin/stock-report" element={<StockReport />} />
//           <Route path="/admin/earnings-report" element={<EarningsReport />} />
//           <Route path="/admin/experiences" element={<AdminExperiences />} />
//           <Route path="/admin/coupons" element={<AdminCoupons />} />
//           <Route path="/admin/coupons/add" element={<AddCoupon />} />
//           <Route path="/admin/coupons/edit/:id" element={<EditCoupon />} />
//           <Route path="/admin/chat" element={<AdminChat />} />
//           <Route path="/admin/quiz-attempts" element={<AdminQuizAttempts />} />
//           <Route path="/admin/sales" element={<AdminSales />} />
//           <Route path="/admin/sales/add" element={<SaleForm />} />
//           <Route path="/admin/sales/edit/:id" element={<SaleForm />} />
//           <Route path="/admin/reviews" element={<AdminReviews />} />
//           <Route path="/admin/popup-settings" element={<AdminPopupList />} />
//           <Route path="/admin/popup-settings/add" element={<AdminPopupAdd />} />
//           <Route path="/admin/popup-settings/edit/:id" element={<AdminPopupEdit />} />
//           <Route path="/admin/about" element={<AdminAbout />} />
//           <Route path="/admin/contactinfo" element={<AdminContactInfo />} />
//           <Route path="/admin/contact-queries" element={<AdminContactQueries />} />
//           {/* admin spin */}
//           <Route path="/admin/spin-rewards" element={<AdminSpinRewards />} />
//           <Route path="/admin/spin-options" element={<AdminSpinOptions />} />
//         </Routes>
//         <Footer />
//         {user?.role === 'User' && <LiveChat userEmail={email} />}
//       </Router>
//     </CartProvider>
//   );
// }

// function App() {
//   return (
//     <AuthProvider>
//       <AppContent />
//     </AuthProvider>
//   );
// }

// export default App;
