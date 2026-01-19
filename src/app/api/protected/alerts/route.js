import { NextResponse } from "next/server";
import { db } from "@/db/index.js";
import { productAlert } from "@/db/schema/domain-schema.js";
import { auth } from "@/app/utils/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function POST(request) {
    
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
    
        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autenticado" },
                { status: 401 }
            );
        }
        
        const body = await request.json();

        const userId = session.user.id;

        const {
            productId,
            productName,
            productUrl,
            currentPrice,
            targetPrice,
        } = body

        if (productId == null || productName == null || productUrl == null || currentPrice == null || targetPrice == null || userId == null) {
            return NextResponse.json(
                { error: "Faltando campos obrigatórios" },
                { status: 400 }
            );
        }

        await db
            .insert(productAlert)
            .values({
                productId,
                productName,
                productUrl,
                currentPrice,
                targetPrice,
                userId,
            })

        return NextResponse.json(
            { success: true},
            { status: 201 }
        );

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Erro ao processar a solicitação" },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autenticado" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const {
            id,
            targetPrice,
        } = body

        if (id == null || targetPrice == null) {
            return NextResponse.json(
                { error: "Faltando campos obrigatórios" },
                { status: 400 }
            );
        }
        
        await db
            .update(productAlert)
            .set({ targetPrice })
            .where(and(eq(productAlert.id, id), eq(productAlert.userId, session.user.id)));

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Erro ao processar a solicitação" },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autenticado" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id } = body;

        if (id == null) {
            return NextResponse.json(
                { error: "ID do alerta é obrigatório" },
                { status: 400 }
            );
        }

        await db
            .delete(productAlert)
            .where(and(eq(productAlert.id, id), eq(productAlert.userId, session.user.id)));

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Erro ao processar a solicitação" },
            { status: 500 }
        );
    }
}