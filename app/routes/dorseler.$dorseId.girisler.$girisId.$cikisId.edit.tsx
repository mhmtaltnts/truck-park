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
  invariant(params.cikisId, "Çıkış numarası bulunamadı");

  const cikis = await prisma.cikis.findUnique({
    where: { id: params.cikisId },
  });
  if (!cikis) {
    throw new Response("Bulunamadı", { status: 404 });
  }
  return json({ cikis });
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.cikisId, "Çıkış numarası bulunamadı");

  const formData = await request.formData();
  const goturen = formData.get("goturen");
  const intent = formData.get("intent");

  if (intent === "cancel") {
    return redirect(`/dorseler/${params.dorseId}/girisler/${params.girisId}`);
  }

  if (intent === "edit") {
    if (typeof goturen !== "string" || goturen.length === 0) {
      return json(
        { errors: { goturen: "Götüren araç plakası gerekli" } },
        { status: 400 },
      );
    }

    await prisma.cikis.update({
      where: {
        id: params.cikisId,
      },
      data: { goturen, userId },
    });

    return redirect(
      `/dorseler/${params.dorseId}/girisler/${params.girisId}/${params.cikisId}`,
    );
  }
};

export default function NewDorseRoute() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData();
  const goturenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.plaka) {
      goturenRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Çıkış Değiştirme Formu</DialogTitle>
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
              <span>Götüren: </span>
              <input
                ref={goturenRef}
                name="goturen"
                defaultValue={data?.cikis?.goturen}
                className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
                aria-invalid={actionData?.errors?.goturen ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.goturen ? "plaka-hatası" : undefined
                }
              />
            </label>
            {actionData?.errors?.goturen ? (
              <div className="pt-1 text-red-700" id="plaka-error">
                {actionData.errors.goturen}
              </div>
            ) : null}
          </div>

          <div className="text-right">
            <Button type="submit" name="intent" value="cancel" variant="ghost">
              İptal
            </Button>
            <Button
              type="submit"
              name="intent"
              value="edit"
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
