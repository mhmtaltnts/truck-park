import { type Dorse, User } from "@prisma/client";
import { Link } from "@remix-run/react";
import * as React from "react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function DorseCard({
  role,
  id,
  plaka,
  firma,
  createdAt,
}: Pick<Dorse, "id" | "plaka" | "firma" | "createdAt"> & Pick<User, "role">) {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{plaka}</CardTitle>
        <CardDescription>
          <span>Firma: {firma}</span>
          <br />
          <span>
            Oluşturulma tarihi:{" "}
            {new Intl.DateTimeFormat("tr", {
              dateStyle: "short",
              timeStyle: "short",
              timeZone: "Europe/Istanbul",
            }).format(new Date(createdAt))}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          <Link to={`${id}/edit`}>Değiştir</Link>
        </Button>
        {role === "admin" ? (
          <Button variant="destructive">
            <Link to={`${id}/delete`}>Sil</Link>
          </Button>
        ) : null}
        <Button variant="default">
          <Link to={`${id}/girisler`}>Girişler</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
