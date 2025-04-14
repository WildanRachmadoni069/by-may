import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface ArticleAuthorCardProps {
  name: string;
  role?: string;
  bio?: string;
  imageSrc?: string;
}

export function ArticleAuthorCard({
  name,
  role = "Penulis",
  bio = "",
  imageSrc = "/img/avatar-placeholder.png",
}: ArticleAuthorCardProps) {
  return (
    <Card className="border border-gray-200 bg-gray-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={imageSrc} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div>
            <div className="font-semibold text-gray-900">{name}</div>
            {role && <div className="text-sm text-primary mb-2">{role}</div>}
            {bio && <p className="text-sm text-gray-600">{bio}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
