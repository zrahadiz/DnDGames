import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import Image, { StaticImageData } from "next/image";

type CardHeroProps = {
  image: StaticImageData | string;
  name: string;
  role: string;
  isTurn: any;
};

export function CardHero({ image, name, role, isTurn }: CardHeroProps) {
  return (
    <Card className="w-full max-w-sm gap-2">
      <CardHeader>
        <div className="w-32 h-32 mx-auto flex items-center justify-center">
          <Image
            src={image}
            alt={name}
            className="mx-auto"
            width={96}
            height={96}
          />
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="truncate">{name}</CardTitle>
        <CardDescription className="truncate">{role}</CardDescription>
      </CardContent>
      <CardFooter>
        <CardAction className="w-full">
          <div
            className={`w-full text-white px-4 py-2 rounded-lg text-center ${
              isTurn ? "bg-purple-600" : "bg-slate-400"
            }`}
          >
            {isTurn ? "It's Turn" : "Waiting for turn"}
          </div>
        </CardAction>
      </CardFooter>
    </Card>
  );
}
