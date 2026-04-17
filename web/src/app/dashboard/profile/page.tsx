"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const fields = [
    { label: "Email", value: user.email },
    { label: "Prénom", value: user.firstName || "—" },
    { label: "Nom", value: user.lastName || "—" },
    { label: "Téléphone", value: user.phone || "—" },
    { label: "Société", value: user.company || "—" },
    { label: "SIRET", value: user.siret || "—" },
    { label: "N° TVA", value: user.tvaNumber || "—" },
    { label: "Inscrit le", value: new Date(user.createdAt).toLocaleDateString("fr-FR") },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mon profil</CardTitle>
          <div className="flex gap-2">
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
            {user.emailVerified ? (
              <Badge variant="outline" className="text-green-600 border-green-200">Email vérifié</Badge>
            ) : (
              <Badge variant="outline" className="text-orange-600 border-orange-200">Email non vérifié</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.label}>
              <dt className="text-sm font-medium text-slate-500">{f.label}</dt>
              <dd className="mt-1 text-sm text-slate-900">{f.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
