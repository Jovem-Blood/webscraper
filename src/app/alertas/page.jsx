import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/app/utils/auth";
import { db } from "@/db";
import { productAlert } from "@/db/schema/domain-schema";
import { eq } from "drizzle-orm";
import AlertCard from "../components/AlertCard";
import { Header } from "../components/Header";

export default async function AlertasPage() {
    const session = await auth.api.getSession({
        headers: Object.fromEntries((await headers()).entries())
    });

    if (!session?.user) {
        redirect("/login");
    }

    const alertas = await db
        .select()
        .from(productAlert)
        .where(eq(productAlert.userId, session.user.id))
        .orderBy(productAlert.createdAt);

    return (
        <div>
            <Header />
            <div className="p-4">
                <h1 className="text-2xl mb-2 font-semibold">Meus alertas</h1>
                {alertas.length === 0 ? (
                    <p>Você não possui alertas configurados.</p>
                ) : ( 
                    <div className="grid md:grid-cols-4 gap-3">
                        {alertas.map((alerta) => (
                            <AlertCard key={alerta.id} alerta={alerta} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
