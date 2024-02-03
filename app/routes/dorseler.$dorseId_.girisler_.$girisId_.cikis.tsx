import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Outlet, useActionData } from "@remix-run/react";
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

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.dorseId, "Dorse numarası gerekli");
  invariant(params.girisId, "Giris numarası gerekli");

  const formData = await request.formData();
  const goturen = formData.get("goturen");
  const intent = formData.get("intent");

  if (intent === "save") {
    if (typeof goturen !== "string" || goturen.length === 0) {
      return json(
        { errors: { goturen: "Götüren araç plakası gerekli" } },
        { status: 400 },
      );
    }
    await prisma.cikis.create({
      data: {
        goturen,
        userId,
        girisId: params.girisId,
      },
    });

    return redirect(`/dorseler/${params.dorseId}/girisler`);
  } else {
    return redirect(`/dorseler/${params.dorseId}/girisler`);
  }
};

export default function DorseGirislerRoute() {
  const actionData = useActionData();
  const goturenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.goturen) {
      goturenRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div>
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Çıkış Formu</DialogTitle>
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
                <span>Goturen: </span>
                <input
                  ref={goturenRef}
                  name="goturen"
                  className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
                  aria-invalid={actionData?.errors?.getiren ? true : undefined}
                  aria-errormessage={
                    actionData?.errors?.goturen
                      ? "goturen-bilgi-hatası"
                      : undefined
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
                variant={"default"}
              >
                Kaydet
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
      <Outlet />
    </div>
  );
}
