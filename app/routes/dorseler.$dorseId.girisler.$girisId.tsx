import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import {
  Link,
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
  Outlet,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.girisId, "Giriş numarası bulunamadı");

  const giris = await prisma.giris.findUnique({
    where: { id: params.girisId },
    select: {
      createdAt: true,
      getiren: true,
      cikis: true,
    },
  });
  if (!giris) {
    throw new Response("Bulunamadı", { status: 404 });
  }
  return json({ giris });
};

export default function GirisDetailsPage() {
  const data = useLoaderData();

  return (
    <div className="max-w-[450px]">
      <h3 className="text-2xl font-bold">Giriş Detayları</h3>
      <hr className="my-4" />
      <div className="flex justify-center items-center gap-2 my-3">
        <ul>
          <li>Giriş Tarihi: {data.giris.createdAt}</li>
          <li>Getiren: {data.giris.getiren}</li>
          <li>
            Çıkış Tarihi:{" "}
            {data.giris.cikis ? data.giris.cikis.createdAt : "Yok"}
          </li>
          <Link to={`${data?.giris.cikis?.id}`}>
            Götüren: {data?.giris?.cikis ? data?.giris?.cikis?.goturen : "Yok"}
          </Link>
        </ul>
      </div>
      <div className="flex gap-2">
        <Link
          to="edit"
          className="bg-blue-600 text-white w-[80px] h-[35px] p-2 text-center rounded-md shadow-lg"
        >
          Değiştir
        </Link>
        <Link
          to="delete"
          className="bg-red-500 text-white w-[80px] h-[35px] p-2 text-center rounded-md shadow-lg"
        >
          Sil
        </Link>
        {!data?.giris?.cikis?.id && (
          <Link
            to="cikis"
            className="bg-red-500 text-white w-[120px] h-[35px] p-2 text-center rounded-md shadow-lg"
          >
            Çıkış Yap
          </Link>
        )}
      </div>

      <hr className="my-4" />
      <Outlet />
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
    return <div>Çıkış bulunamadı</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
