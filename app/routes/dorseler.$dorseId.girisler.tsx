import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";

import {
  Link,
  Outlet,
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
  NavLink,
} from "@remix-run/react";

export const loader = async ({ params, request }: LoaderArgs) => {
  const girisler = await prisma.giris.findMany({
    where: { dorseId: params.dorseId },
    select: {
      id: true,
      yuk: true,
      createdAt: true,
      cikis: true,
      getiren: true,
    },
  });
  if (!girisler) {
    throw new Response("Giriş Bulunamadı", { status: 404 });
  }

  return json({ girisler });
};

export default function GirisIdexPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="max-w-[850px]">
      <h3 className="text-2xl font-bold">Girişler</h3>
      <hr className="my-4" />
      {data.girisler.length === 0 ? (
        <h3 className="text-red-900">Dorsenin Parka Girişi Yok</h3>
      ) : (
        <ul>
          {data?.girisler?.map((giris) => (
            <li key={giris.id}>
              <div className="flex justify-start items-center">
                <NavLink
                  to={`${giris.id}`}
                  className={({ isActive }) =>
                    `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                  }
                >
                  <span>{giris.createdAt}</span> <span>{giris.getiren}</span>|
                  <span>{giris.yuk}</span>|
                  <span className="text-red-900">
                    Çıkış Tarihi: {giris.cikis?.createdAt}
                  </span>
                  |
                  <span className="text-red-900">
                    Götüren: {giris.cikis?.goturen}
                  </span>
                  |
                </NavLink>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link to="new">Giriş Yap</Link>
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Dorse bulunamadı</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
