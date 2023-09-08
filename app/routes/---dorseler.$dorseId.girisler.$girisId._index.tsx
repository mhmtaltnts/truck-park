import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";

import {
  Outlet,
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";

export const loader = async ({ params, request }: LoaderArgs) => {
  const giris = await prisma.giris.findUnique({
    where: { id: params.girisId },
  });

  if (!giris) {
    throw new Response("Giriş Bulunamadı", { status: 404 });
  }

  return json({ giris });
};

export default function GirisDetailIdexPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="max-w-[450px]">
      <h3 className="text-2xl font-bold">Girişler</h3>
      <hr className="my-4" />
      <p>
        {data?.giris?.createdAt} {data?.giris?.getiren}
      </p>

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
