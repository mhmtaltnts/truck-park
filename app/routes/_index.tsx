import type { V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";

import { useOptionalUser } from "~/utils";

export const meta: V2_MetaFunction = () => [{ title: "Remix Notes" }];

export default function Index() {
  const user = useOptionalUser();
  return (
    <>
      <header className="flex justify-between w-full items-center shadow-xl sm:overflow-hidden sm:rounded-2xl">
        <div className="text-3xl p-4">
          <Link to="/">Akbaşlar</Link>
        </div>
        <nav>
          <div className="mx-auto max-w-sm sm:flex sm:max-w-none sm:justify-center">
            {user ? (
              <Button>
                <Link
                  to="/dorseler"
                  className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50 sm:px-8"
                >
                  View Notes for {user.email}
                </Link>
              </Button>
            ) : (
              <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                <Button className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50 sm:px-8">
                  <Link to="/join">Sign up</Link>
                </Button>
                <Button className="flex items-center justify-center rounded-md bg-blue-500 px-4 py-3 font-medium text-white hover:bg-blue-600">
                  <Link to="/login">Log In</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      </header>
      <main className="relative min-h-screen sm:flex sm:items-center sm:justify-center"></main>
    </>
  );
}
