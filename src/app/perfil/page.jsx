import { headers } from "next/headers";
import { auth } from "../utils/auth";
import { redirect } from "next/navigation";
import PerfilClient from "./PerfilClient";

export default async function PerfilPage(){

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        redirect("/login");
    }

    const user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
    };

    return(
        <PerfilClient user={user} />
    )
}