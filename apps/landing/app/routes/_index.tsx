import { redirect } from "react-router";

export function loader() {
  return redirect("/retro");
}

export default function Index() {
  return null; // This component won't render as the redirect will happen first
}
