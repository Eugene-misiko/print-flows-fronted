import { useSelector } from "react-redux";
import Products from "./Products";

export default function Home() {
  const { user } = useSelector((state) => state.auth);

  if (user?.role === "client") {
    return <Products />;
  }

  if (user?.role === "admin") {
    return <Products/>
  }

  if (user?.role === "designer") {
    return <h2 className="text-2xl font-bold">Designer Dashboard</h2>;
  }

  if (user?.role === "printer") {
    return <h2 className="text-2xl font-bold">Printer Dashboard</h2>;
  }

  return null;
}