import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { prisma } from "~/db.server";

import { createDorse } from "~/models/dorse.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionArgs) => {
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

  const foundDorse = await prisma.dorse.findUnique({
    where: { plaka },
  });

  if (!foundDorse) {
    const dorse = await createDorse({ plaka, firma, userId });
    return redirect(`/dorseler/${dorse.id}`);
  }

  return json(
    { errors: { firma: null, plaka: "Plaka mevcut" } },
    { status: 400 },
  );
};

export default function NewDorsePage() {
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
    <div>
      <h1 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        Yeni Dorse Ekleme Formu
      </h1>

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
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Kaydet
          </button>
        </div>
      </Form>
    </div>
  );
}
