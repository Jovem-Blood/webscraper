'use client'

import { DialogTitle } from "@radix-ui/react-dialog";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "./ui/dialog";
import { NumericFormat } from "react-number-format";
import { useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Bell, Edit2, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { formatarMoeda } from "../utils/preco";

export default function AlertCard({ alerta }) {
    const [targetPrice, setTargetPrice] = useState(alerta.targetPrice);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const router = useRouter();

    const priceDifference = alerta.currentPrice - alerta.targetPrice;
    const percentageDifference = ((priceDifference / alerta.targetPrice) * 100).toFixed(1);
    const isAboveTarget = priceDifference > 0;

    async function editarAlerta() {
        const payload = {
            id: alerta.id,
            targetPrice: targetPrice
        }

        const response = await fetch('/api/protected/alerts', {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Alerta atualizado com sucesso!');
            setOpenEditDialog(false);
            router.refresh();
        } else {
            alert('Erro ao atualizar o alerta.');
        }
    }

    async function excluirAlerta() {
        const payload = {
            id: alerta.id
        }

        const response = await fetch('/api/protected/alerts', {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Alerta excluído com sucesso!');
            setOpenDeleteDialog(false);
            router.refresh();
        } else {
            alert('Erro ao excluir o alerta.');
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <a 
                            href={alerta.productUrl} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-semibold text-secondary hover:text-blue-600 hover:underline line-clamp-2 transition-colors"
                        >
                            {alerta.productName}
                        </a>
                    </div>
                </div>
            </div>
            <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Preço atual</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatarMoeda(alerta.currentPrice)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Preço alvo</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {formatarMoeda(alerta.targetPrice)}         
                        </p>
                    </div>
                </div>

                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    isAboveTarget 
                        ? 'bg-amber-50 border border-amber-200' 
                        : 'bg-green-50 border border-green-200'
                }`}>
                    {isAboveTarget ? (
                        <TrendingUp className="w-5 h-5 text-amber-600" />
                    ) : (
                        <TrendingDown className="w-5 h-5 text-green-600" />
                    )}
                    <div className="flex-1">
                        <p className={`text-sm font-semibold ${
                            isAboveTarget ? 'text-amber-700' : 'text-green-700'
                        }`}>
                            {isAboveTarget ? 'Acima' : 'Abaixo'} do alvo
                        </p>
                        <p className={`text-xs ${
                            isAboveTarget ? 'text-amber-600' : 'text-green-600'
                        }`}>
                            {formatarMoeda(Math.abs(priceDifference))} ({Math.abs(percentageDifference)}%)
                        </p>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-lg flex gap-2">
                <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                    <DialogTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            Editar
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Editar Alerta</DialogTitle>
                        </DialogHeader>
                        <div>
                            <label htmlFor="priceGoal" className="text-sm font-medium text-gray-700 mb-2 block">
                                Preço Alvo
                            </label>
                            <NumericFormat
                                value={targetPrice}
                                onValueChange={(values) => setTargetPrice(values.floatValue)}
                                className='w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                                placeholder='Preço alvo em R$'
                                allowLeadingZeros={false}
                                allowNegative={false}
                                decimalScale={2}
                                fixedDecimalScale={true}
                                decimalSeparator=','
                                allowedDecimalSeparators={['.']}
                                prefix='R$ '
                                thousandSeparator='.'
                            />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancelar</Button>
                                </DialogClose>
                                <Button onClick={editarAlerta}>Salvar alteração</Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                    <DialogTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Excluir Alerta</DialogTitle>
                        </DialogHeader>
                        <DialogDescription className="text-foreground">
                            Tem certeza que deseja excluir este alerta? Esta ação não pode ser desfeita.
                        </DialogDescription>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button 
                                onClick={excluirAlerta}
                                className="bg-red-200 hover:bg-red-300 text-red-800 hover:text-red-900"
                            >
                                Excluir
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}