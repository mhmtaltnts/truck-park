import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { type GirisCikisT, columns, DataTable } from "./giris-cikis-table";

import {
  Link,
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import { Button } from "~/components/ui/button";

export const loader = async ({ params, request }: LoaderArgs) => {
  const dorse = await prisma.dorse.findUnique({
    where: { id: params.dorseId },
  });
  const girisler = await prisma.giris.findMany({
    where: { dorseId: params.dorseId },
    select: {
      id: true,
      yuk: true,
      createdAt: true,
      getiren: true,
      cikis: {
        select: {
          createdAt: true,
          goturen: true,
        },
      },
    },
  });
  const girisCikis: GirisCikisT[] = girisler.map((giris) => {
    return {
      id: giris?.id,
      yuk: giris?.yuk,
      girisTarihi: giris?.createdAt.toString() as String,
      cikisTarihi: giris?.cikis?.createdAt.toString() as String,
      getiren: giris?.getiren,
      goturen: giris?.cikis?.goturen as String,
    };
  });
  if (!girisler) {
    throw new Response("Giriş Bulunamadı", { status: 404 });
  }

  return json({ girisCikis, dorse });
};

export default function GirisIdexPage() {
  const { girisCikis, dorse } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-[1200px]">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        {dorse?.plaka} Girişleri
      </h2>
      <hr className="my-4" />
      <div className="flex w-full justify-end py-2">
        <Button variant={"default"}>
          <Link to="new">Giriş Yap</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={girisCikis} />
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
