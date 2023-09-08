import { useEffect, useRef } from "react";

import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
  useParams,
} from "@remix-run/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import invariant from "tiny-invariant";
import { Button } from "~/components/ui/button";
import { requireUserId } from "~/session.server";
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

export const action = async ({ params, request }: ActionArgs) => {
  const formData = request.formData();
  const plaka = (await formData).get("plaka");
  const firma = (await formData).get("firma");
  const intent = (await formData).get("intent");
  const userId = await requireUserId(request);
  invariant(params.dorseId, "Dorse numarası bulunamadı");

  if (intent === "cancel") {
    return redirect(`/dorseler/${params.dorseId}`);
  }

  if (intent === "update") {
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

    await prisma.dorse.update({
      where: { id: params.dorseId },
      data: { plaka, firma, userId },
    });
    return redirect(`/dorseler/${params.dorseId}`);
  }
};

export default function EditDorseRoute() {
  const params = useParams();
  const open = !params.edit;
  const data = useLoaderData();
  const actionData = useActionData();

  const plakaRef = useRef<HTMLInputElement>(null);
  const firmaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.plaka) {
      plakaRef.current?.focus();
    } else if (actionData?.errors?.firma) {
      firmaRef.current?.focus();
    }
  }, [actionData]);
  return (
    <div className="flex gap-2">
      <Dialog open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni</DialogTitle>
            <DialogDescription></DialogDescription>
            <Form method="post" key={data.dorse?.id ?? "new"}>
              <fieldset className="flex gap-2">
                <label htmlFor="plaka">Plaka:</label>
                <Input
                  ref={plakaRef}
                  id="plaka"
                  type="text"
                  name="plaka"
                  defaultValue={data.dorse.plaka}
                  aria-invalid={actionData?.errors?.plaka ? true : undefined}
                  aria-errormessage={
                    actionData?.errors?.plaka ? "plaka-hatası" : undefined
                  }
                />
                {actionData?.errors?.plaka ? (
                  <div className="pt-1 text-red-700" id="plaka-error">
                    {actionData.errors.plaka}
                  </div>
                ) : null}
              </fieldset>
              <hr className="my-4" />
              <fieldset className="flex gap-2">
                <label>Fİrma:</label>
                <Input
                  ref={firmaRef}
                  type="text"
                  name="firma"
                  defaultValue={data.dorse.firma}
                  aria-invalid={actionData?.errors?.firma ? true : undefined}
                  aria-errormessage={
                    actionData?.errors?.firma ? "firma-hatası" : undefined
                  }
                />
                {actionData?.errors?.firma ? (
                  <div className="pt-1 text-red-700" id="firma-error">
                    {actionData.errors.firma}
                  </div>
                ) : null}
              </fieldset>
              <hr className="my-4" />
              <div className="flex justify-end px-8 gap-2">
                <Button
                  type="submit"
                  variant={"ghost"}
                  size={"sm"}
                  name="intent"
                  value="cancel"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant={"warning"}
                  size={"sm"}
                  name="intent"
                  value="update"
                >
                  Değiştir
                </Button>
              </div>
            </Form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
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
