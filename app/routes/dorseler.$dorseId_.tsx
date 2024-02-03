import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import {
  Outlet,
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { prisma } from "~/db.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.dorseId, "Dorse numarası bulunamadı");

  const dorse = await prisma.dorse.findUnique({
    where: { id: params.dorseId },
  });
  if (!dorse) {
    throw new Response("Bulunamadı", { status: 404 });
  }
  return json({ dorse });
};

export default function DorseDetailsPage() {
  const data = useLoaderData();

  return (
    <div className="max-w-[1200px]">
      <h3 className="text-2xl font-bold">Dorse Bilgilerini</h3>
      <hr className="my-4" />
      <div className="flex justify-center items-center gap-2 my-3">
        <h1>Plaka: {data.dorse.plaka}</h1>
        <p>Firma: {data.dorse.firma}</p>
      </div>
      {/* <div className="flex gap-2">
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
        <Link
          to="girisler"
          className="bg-red-500 text-white w-[80px] h-[35px] p-2 text-center rounded-md shadow-lg"
        >
          Girişler
        </Link>
      </div> */}
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
    return <div>Dorse bulunamadı</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
