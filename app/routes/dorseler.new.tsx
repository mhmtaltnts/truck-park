import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { prisma } from "~/db.server";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const plaka = formData.get("plaka");
  const firma = formData.get("firma");
  const intent = formData.get("intent");

  if (intent === "create") {
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

    const foundDorse = await prisma.dorse.findUnique({
      where: {
        plaka,
      },
    });

    if (!foundDorse) {
      const dorse = await prisma.dorse.create({
        data: { plaka, firma, userId },
      });
      return redirect(`/dorseler/${dorse.id}`);
    }

    return json(
      { errors: { firma: null, plaka: "Plaka mevcut." } },
      { status: 400 },
    );
  }

  if (intent === "cancel") {
    return redirect(`/dorseler`);
  }
};

export default function NewDorseRoute() {
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
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Dorse Ekleme Formu</DialogTitle>
        </DialogHeader>
        <Form
          method="post"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
          }}
        >
          <div>
            <label className="flex w-full flex-col gap-1">
              <span>Plaka: </span>
              <input
                ref={plakaRef}
                name="plaka"
                className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
                aria-invalid={actionData?.errors?.plaka ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.plaka ? "plaka-hatası" : undefined
                }
              />
            </label>
            {actionData?.errors?.plaka ? (
              <div className="pt-1 text-red-700" id="plaka-error">
                {actionData.errors.plaka}
              </div>
            ) : null}
          </div>

          <div>
            <label className="flex w-full flex-col gap-1">
              <span>Firma: </span>
              <input
                ref={firmaRef}
                name="firma"
                className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
                aria-invalid={actionData?.errors?.firma ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.firma ? "firma-hatası" : undefined
                }
              />
            </label>
            {actionData?.errors?.firma ? (
              <div className="pt-1 text-red-700" id="firma-error">
                {actionData.errors.firma}
              </div>
            ) : null}
          </div>

          <div className="text-right">
            <Button
              type="submit"
              name="intent"
              value="cancel"
              variant={"ghost"}
            >
              İptal
            </Button>
            <Button
              type="submit"
              name="intent"
              value="create"
              variant={"warning"}
            >
              Kaydet
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
