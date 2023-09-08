import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";

import {
  Link,
  Outlet,
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";

export const loader = async ({ params, request }: LoaderArgs) => {
  const cikis = await prisma.cikis.findUnique({
    where: { id: params.cikisId },
    select: {
      id: true,
      createdAt: true,
      goturen: true,
    },
  });
  if (!cikis) {
    throw new Response("Giriş Bulunamadı", { status: 404 });
  }

  return json({ cikis });
};

export default function GirisIdexPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="max-w-[850px]">
      <h3 className="text-2xl font-bold">Çıkış Detayı</h3>
      <hr className="my-4" />
      <p>{data?.cikis?.goturen}</p>
      <p>{data?.cikis?.createdAt}</p>
      <div className="flex gap-2">
        <Link
          to={`${data?.cikis.id}/edit`}
          className="bg-blue-600 text-white w-[80px] h-[35px] p-2 text-center rounded-md shadow-lg"
        >
          Değiştir
        </Link>
        <Link
          to={`${data?.cikis.id}/delete`}
          className="bg-red-500 text-white w-[80px] h-[35px] p-2 text-center rounded-md shadow-lg"
        >
          Sil
        </Link>
      </div>
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
    return <div>Çıkış bulunamadı</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
