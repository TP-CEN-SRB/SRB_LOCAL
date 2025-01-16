import HomeScreen from "@/components/HomeScreen";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const Home = () => {
  const token = cookies().get("token");
  const payload = jwt.decode(token?.value as string);
  const id =
    payload && typeof payload !== "string" ? payload.userId : undefined;
  return <HomeScreen id={id} />;
};

export default Home;
