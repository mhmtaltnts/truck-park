import { type Dorse } from "@prisma/client";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { sessionStorage } from "./session.server";

import { prisma } from "./db.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

const DORSE_SESSION_KEY = "dorseId";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getDorseId(
  request: Request,
): Promise<Dorse["id"] | undefined> {
  const session = await getSession(request);
  const dorseId = session.get(DORSE_SESSION_KEY);
  return dorseId;
}

export async function getDorse(request: Request) {
  const dorseId = await getDorseId(request);
  if (dorseId === undefined) return null;

  const dorse = await prisma.dorse.findFirst({ where: { id: dorseId } });
  if (dorse) return dorse;
}

export async function requireDorseId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const dorseId = await getDorseId(request);
  if (!dorseId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return dorseId;
}

export async function requireDorse(request: Request) {
  const dorseId = await requireDorseId(request);

  const dorse = await prisma.dorse.findUnique({ where: { id: dorseId } });
  if (dorse) return dorse;

  return "dorse not found";
}

export async function createDorseSession({
  request,
  dorseId,
  remember,
  redirectTo,
}: {
  request: Request;
  dorseId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(DORSE_SESSION_KEY, dorseId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}
