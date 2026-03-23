import { useParams } from "react-router-dom";
import AccProfile from "@/components/profile/AccProfile";

export default function PublicProfileWrapper() {
  const { id } = useParams();
  
  // Passa userId como prop para AccProfile
  return <AccProfile userId={id} />;
}
