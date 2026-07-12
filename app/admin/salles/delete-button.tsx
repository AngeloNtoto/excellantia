"use client";

import { useTransition } from "react";
import { deleteRoomAction } from "@/lib/actions/rooms";
import { useRouter } from "next/navigation";

export function DeleteRoomButton({ roomId }: { roomId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette salle et toutes ses données associées (tentatives, réponses) ? Cette action est irréversible.")) {
      startTransition(async () => {
        const res = await deleteRoomAction(roomId);
        if (res.error) {
          alert(res.error);
        } else {
          router.refresh();
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isPending}
      className="btn btn-ghost" 
      style={{ padding: "4px 8px", fontSize: "0.75rem", color: "var(--danger)" }}
    >
      {isPending ? "Suppression..." : "Supprimer"}
    </button>
  );
}
