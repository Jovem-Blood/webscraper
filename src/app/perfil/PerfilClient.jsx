'use client';

import { useState } from "react";
import { Header } from "../components/Header";
import { authClient } from "../utils/auth-client";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function PerfilClient({ user }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const { refreshUser } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();

    if (email.length !== 0 && email.toLowerCase() !== user.email.toLowerCase()) {

      if (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi.test(email) === false) {
        alert('Por favor, insira um email válido.');
        return;
      }

      const response = await authClient.changeEmail({
          newEmail: email,
      });

      if (response.error) {
          alert('Erro ao atualizar o email: ' + response.error.message);
          return;
      }

      router.refresh();
      await refreshUser();
      alert('Email atualizado com sucesso!');
    }

    if (name.length !== 0 && name !== user.name) {
      const response = await authClient.updateUser({
          name: name,
      });

      if (response.error) {
          alert('Erro ao atualizar o nome: ' + response.error.message);
          return;
      }

      router.refresh();
      await refreshUser();
      alert('Nome atualizado com sucesso!');
    }

    if (newPassword.length !== 0) {
      if (newPassword.length < 8) {
        alert('A senha deve ter pelo menos 8 caracteres.');
        return;
      }

      if (oldPassword.length === 0) {
        alert('Por favor, insira sua senha atual para alterar a senha.');
        return;
      }

      if (oldPassword === newPassword) {
        alert('A nova senha deve ser diferente da senha atual.');
        return;
      }

      const { data, error } = await authClient.changePassword({
          newPassword: newPassword,
          currentPassword: oldPassword,
          revokeOtherSessions: true,
      }, {
          onRequest: (ctx) => {},
          onSuccess: async (ctx) => {
              router.refresh();
              await refreshUser();
              alert('Senha atualizada com sucesso!');
          },
          onError: (ctx) => {
              alert(ctx.error.message || 'Erro ao atualizar a senha');
          },
      });

    }

  }

  return (
    <>
      <Header />
      <div className="max-w-xl p-6">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nome</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Senha Atual</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              placeholder="Digite sua senha atual"
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Senha</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              placeholder="Digite uma nova senha"
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button className="bg-secondary text-white px-4 py-2 rounded">
            Salvar
          </button>
        </form>
      </div>
    </>
  );
}
