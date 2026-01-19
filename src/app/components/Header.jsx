'use client';

import { SearchBar } from "./SearchBar";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "./ui/navigation-menu";

export function Header({searchValue, onSearchChange, onSearchSubmit}) {
  const router = useRouter();

  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-secondary text-white p-4 shadow-md flex items-center justify-between">
      <h1 className="text-2xl font-bold hover:cursor-pointer" onClick={() => window.location.href = '/'}>MeliTrack</h1>
      <div className="flex items-center gap-4">
        {(searchValue !== undefined && onSearchChange !== undefined && onSearchSubmit !== undefined) && (
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
          />
        )}
        {user ? (
          <NavigationMenu>
            <NavigationMenuList className="flex-wrap">
              <NavigationMenuItem>
                <NavigationMenuTrigger>{user.name}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="flex flex-col gap-2 w-40">
                    <li>
                      <NavigationMenuLink asChild>
                        <button className="w-full" onClick={() => router.push('/perfil')}>Perfil</button>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <button className="w-full" onClick={() => router.push('/alertas')}>Meus Alertas</button>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <button className="w-full" onClick={logout}>Logout</button>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        ) : (
          <span onClick={() => router.push('/login')} className="text-sm underline hover:cursor-pointer">
            Entrar
          </span>
        )}
      </div>
    </header>
  );
}