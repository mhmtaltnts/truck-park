import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { prisma } from "~/db.server";
import invariant from "tiny-invariant";
import { requireUserId } from "~/session.server";

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.dorseId, "Dorse numarası bulunamadı");

  const formData = await request.formData();
  const getiren = formData.get("getiren");
  const yuk = formData.get("yuk");

  if (typeof getiren !== "string" || getiren.length === 0) {
    return json(
      { errors: { yuk: null, getiren: "Getiren araç plakası gerekli" } },
      { status: 400 },
    );
  }

  if (typeof yuk !== "string" || yuk.length === 0) {
    return json(
      { errors: { yuk: "Yuk gerekli", getiren: null } },
      { status: 400 },
    );
  }

  const giris = await prisma.giris.create({
    data: { getiren, yuk, userId, dorseId: params.dorseId },
  });

  console.log(giris);

  return redirect(`/dorseler/${params.dorseId}`);
};

export default function NewGirisRoute() {
  const params = useParams();
  const actionData = useActionData();
  const getirenRef = useRef<HTMLInputElement>(null);
  const yukRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.plaka) {
      getirenRef.current?.focus();
    } else if (actionData?.errors?.firma) {
      yukRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Dialog open={!params.new}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Giriş Ekleme Formu</DialogTitle>
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
              <span>Getiren: </span>
              <input
                ref={getirenRef}
                name="getiren"
                className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
                aria-invalid={actionData?.errors?.getiren ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.getiren ? "plaka-hatası" : undefined
                }
              />
            </label>
            {actionData?.errors?.getiren ? (
              <div className="pt-1 text-red-700" id="plaka-error">
                {actionData.errors.getiren}
              </div>
            ) : null}
          </div>

          <div>
            <label className="flex w-full flex-col gap-1">
              <span>Yük: </span>
              <input
                ref={yukRef}
                name="yuk"
                className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
                aria-invalid={actionData?.errors?.yuk ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.yuk ? "firma-hatası" : undefined
                }
              />
            </label>
            {actionData?.errors?.yuk ? (
              <div className="pt-1 text-red-700" id="firma-error">
                {actionData.errors.yuk}
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
      </DialogContent>
    </Dialog>
  );
}
