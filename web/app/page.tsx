import { redirect } from "next/navigation";

// The mirror screen is the only screen: / always sends the browser to /mirror.
export default function Home() {
  redirect("/mirror");
}
