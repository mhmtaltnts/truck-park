import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
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
import { Button } from "~/components/ui/button";

export const loader = async ({ params, request }: LoaderArgs) => {
  //invariant(params.dorseId, "Dorse numarası bulunamadı");
  invariant(params.girisId, "Giriş numarası bulunamadı");

  const giris = await prisma.giris.findUnique({
    where: { id: params.girisId },
  });
  if (!giris) {
    throw new Response("Giriş Bulunamadı", { status: 404 });
  }
  return json({ giris });
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.girisId, "Giriş numrası bulunamadı");

  const formData = await request.formData();
  const getiren = formData.get("getiren");
  const yuk = formData.get("yuk");
  const intent = formData.get("intent");
  if (intent === "save") {
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

    await prisma.giris.update({
      where: { id: params.girisId },
      data: { getiren, yuk, userId, dorseId: params.dorseId },
    });

    return redirect(`/dorseler/${params.dorseId}/girisler/${params.girisId}`);
  }
  if (intent === "cancel") {
    return redirect(`/dorseler/${params.dorseId}/girisler/${params.girisId}`);
  }
};

export default function EditGirisRoute() {
  const { giris } = useLoaderData<typeof loader>();
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
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Giriş Değiştir.</DialogTitle>
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
                defaultValue={giris.getiren}
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
                defaultValue={giris.yuk}
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
              value="save"
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
