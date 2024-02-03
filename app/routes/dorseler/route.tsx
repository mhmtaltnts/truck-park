import type { Dorse } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";

import { useEffect, useRef } from "react";
import { Loader2, Search } from "lucide-react";
import { Label } from "~/components/ui/label";

import { getDorseList } from "~/models/dorse.server";
//import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { DorseCard } from "./dorse-card";

export const loader = async ({ request }: LoaderArgs) => {
  //const userId = await requireUserId(request);
  const { searchParams } = new URL(request.url);
  const dorseList = await getDorseList();

  const q = searchParams.get("q");

  const dorseFiltered = q
    ? dorseList.filter((dorse) =>
        dorse.plaka.toLowerCase().includes(q?.toLowerCase() || ""),
      )
    : dorseList;

  return json({ dorseFiltered, q });
};

/* export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const plaka = formData.get("plaka");
  const firma = formData.get("firma");

  if (typeof plaka !== "string" || plaka.length === 0) {
    return json(
      { errors: { firma: null, plaka: "Plaka gerekli" } },
      { status: 400 },
    );
  }

  if (typeof firma !== "string" || firma.length === 0) {
    return json(
      { errors: { firma: "Firma gerekli", plaka: null } },
      { status: 400 },
    );
  }
  const dorse = await createDorse({ plaka, firma, userId });

  return redirect(`dorses/${dorse.id}`);
}; */

export default function DorsesPage() {
  const searchRef = useRef<HTMLInputElement>(null);
  const { dorseFiltered, q } = useLoaderData();
  const user = useUser();
  const submit = useSubmit();
  const navigation = useNavigation();

  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    if (searchRef.current !== null) {
      searchRef.current.value = q;
    }
  }, [q]);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Dorseler</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Çıkış
          </button>
        </Form>
      </header>

      <main className="flex flex-row w-full justify-start items-start bg-white">
        <div className="flex flex-col items-center justify-start">
          <div className="flex justify-start items-center w-full">
            <Form id="search-form" role="search">
              <div className="flex justify-center group cursor-pointer border-2 rounded-lg hover:border-blue-900 items-center py-2 px-3 m-2 gap-2">
                <Label htmlFor="q">
                  {searching ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search />
                  )}
                </Label>
                <input
                  className="outline-none group-hover: border-black-500"
                  ref={searchRef}
                  id="q"
                  aria-label="Search contacts"
                  placeholder="Search"
                  type="search"
                  name="q"
                  defaultValue={q}
                  onChange={(event) => {
                    const isFirstSearch = q == null;
                    submit(event.currentTarget.form, {
                      replace: !isFirstSearch,
                    });
                  }}
                />
              </div>
            </Form>
            <Link to="new">Yeni</Link>
          </div>
          <div className="w-120 border-r bg-gray-50 overflow-scroll">
            {dorseFiltered.length === 0 ? (
              <p className="p-4">Henüz kayıtlı dorse yok</p>
            ) : (
              <ol>
                {dorseFiltered.map((dorse: Dorse) => (
                  <li key={dorse.id}>
                    <NavLink
                      className={({ isActive }) =>
                        `block border-b p-4 text-xl ${
                          isActive ? "bg-white" : ""
                        }`
                      }
                      to={dorse.id}
                    >
                      <DorseCard
                        role={user.role}
                        id={dorse.id}
                        plaka={dorse.plaka}
                        firma={dorse.firma}
                        createdAt={dorse.createdAt}
                      />
                    </NavLink>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-start items-start p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
