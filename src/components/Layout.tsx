import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AuthUserFooter from "./AuthUserFooter";
import { useAuth } from "@/hooks/useAuth";

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main" role="main" className="flex-1">
        <Outlet />
      </main>
      {user ? <AuthUserFooter /> : <Footer />}
    </div>
  );
};

export default Layout;
