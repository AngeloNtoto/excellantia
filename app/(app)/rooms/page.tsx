import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { checkRoomStatuses } from "@/lib/actions/rooms";
import { RoomsClient } from "./rooms-client";

function getEffectiveEndAt(room: any) {
  if (room.endsAt) return new Date(room.endsAt);
  if (room.timeMode === "ABSOLUTE" && room.startsAt) {
    return new Date(new Date(room.startsAt).getTime() + room.durationMin * 60_000);
  }
  return null;
}

function isRoomExpired(room: any, now: Date, attempts: Array<{ status: string }>) {
  const effectiveEndAt = getEffectiveEndAt(room);
  const byStatus = room.status === "CLOSED" || room.status === "CANCELLED";
  const byTime = !!effectiveEndAt && effectiveEndAt <= now;

  const allAttemptsSubmitted = attempts.length > 0 && attempts.every((attempt) =>
    attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED_TIME_EXPIRED" || attempt.status === "AUTO_SUBMITTED_DISCONNECTED"
  );

  return byStatus || byTime || (room.timeMode === "RELATIVE" && allAttemptsSubmitted);
}

export const metadata = { title: "Salles disponibles" };

export default async function RoomsPage() {
  const session = await getSession();
  if (!session) redirect("/");

  // Vérifier et mettre à jour le statut des salles (démarrage / fermeture automatique)
  await checkRoomStatuses();

  const [rooms, roomAccesses, participatedRooms] = await Promise.all([
    prisma.room.findMany({
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { role: true } } }
    }),
    prisma.roomAccess.findMany({
      where: { userId: session.id },
      select: { roomId: true }
    }),
    prisma.attempt.findMany({
      where: { userId: session.id },
      select: { roomId: true }
    })
  ]);

  const roomAttemptMap = new Map<string, Array<{ status: string }>>();
  const roomIds = rooms.map((room: any) => room.id);
  if (roomIds.length > 0) {
    const attempts = await prisma.attempt.findMany({
      where: { roomId: { in: roomIds } },
      select: { roomId: true, status: true }
    });

    for (const attempt of attempts) {
      const existing = roomAttemptMap.get(attempt.roomId) ?? [];
      existing.push({ status: attempt.status });
      roomAttemptMap.set(attempt.roomId, existing);
    }
  }

  const accessibleRoomIds = new Set([
    ...roomAccesses.map((access: { roomId: string }) => access.roomId),
    ...participatedRooms.map((attempt: { roomId: string }) => attempt.roomId)
  ]);

  const now = new Date();

  const visibleRooms = rooms.filter((r: any) => {
    const isExpired = isRoomExpired(r, now, roomAttemptMap.get(r.id) ?? []);
    const isActiveRoom = !isExpired && (r.status === "RUNNING" || r.status === "SCHEDULED" || r.status === "WAITING");
    const isPrivateRoom = r.visibility === "PRIVATE";

    if (r.visibility === "PUBLIC") return true;
    if (r.createdById === session.id || r.createdBy.role === "ADMIN") return true;
    if (isPrivateRoom && isActiveRoom) return true;
    return accessibleRoomIds.has(r.id);
  });

  const availableRooms = visibleRooms.filter((r: any) => {
    const isExpired = isRoomExpired(r, now, roomAttemptMap.get(r.id) ?? []);
    return !isExpired && (r.status === "RUNNING" || r.status === "SCHEDULED" || r.status === "WAITING");
  });
  
  const pastRooms = visibleRooms.filter((r: any) => {
    return isRoomExpired(r, now, roomAttemptMap.get(r.id) ?? []);
  });

  return (
    <RoomsClient 
      availableRooms={availableRooms} 
      pastRooms={pastRooms} 
    />
  );
}
