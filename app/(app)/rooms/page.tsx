import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { checkScheduledRooms } from "@/lib/actions/rooms";
import { RoomsClient } from "./rooms-client";

export const metadata = { title: "Salles disponibles" };

export default async function RoomsPage() {
  const session = await getSession();
  if (!session) redirect("/");

  // Vérifier si des salles programmées doivent démarrer
  await checkScheduledRooms();

  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { role: true } } }
  });

  const visibleRooms = rooms.filter(
    (r) => r.visibility === "PUBLIC" || r.createdById === session.id || r.createdBy.role === "ADMIN"
  );

  const availableRooms = visibleRooms.filter(
    (r) => r.status === "RUNNING" || r.status === "SCHEDULED" || r.status === "WAITING"
  );
  
  const pastRooms = visibleRooms.filter((r) => r.status === "CLOSED");

  return (
    <RoomsClient 
      availableRooms={availableRooms} 
      pastRooms={pastRooms} 
    />
  );
}
