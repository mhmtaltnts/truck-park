import { prisma } from "~/db.server";
import type { Dorse, User } from "@prisma/client";

export function getDorse({
  id,
  userId,
}: Pick<Dorse, "id"> & {
  userId: User["id"];
}) {
  return prisma.dorse.findFirst({
    select: { id: true, plaka: true, firma: true },
    where: { id, userId },
  });
}

export function getDorseList() {
  return prisma.dorse.findMany();
}

export function getDorseListItems({ q }: { q: string }) {
  return prisma.dorse.findUnique({
    where: { plaka: q },
    select: { id: true, plaka: true, firma: true },
  });
}

export function updateDorse({
  id,
  plaka,
  firma,
  userId,
}: Pick<Dorse, "id" | "plaka" | "firma"> & { userId: User["id"] }) {
  return prisma.dorse.update({
    where: { id },
    data: {
      plaka,
      firma,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function createDorse({
  plaka,
  firma,
  userId,
}: Pick<Dorse, "plaka" | "firma"> & { userId: User["id"] }) {
  return prisma.dorse.create({
    data: {
      plaka,
      firma,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteDorse({
  id,
  userId,
}: Pick<Dorse, "id"> & { userId: User["id"] }) {
  return prisma.dorse.deleteMany({
    where: { id, userId },
  });
}
