import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { number } from "zod";

export const useFavorites = () => {

    const [favoriteID, setFavoritesID] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { data: session } = useSession();

    const fetchFavorites = useCallback(async () => {

        if (!session?.user?.id) {
            setFavoritesID([]);
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.get("/api/favorites");
            const ids = data.map((item: any) => item.prompt_id);
            setFavoritesID(ids);
        } catch (error) {
            console.log("Error fetching favorites:", error);
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const toggleFavorite = async (promptId: number) => {

        if (!session?.user?.id) {
            toast.error("Please login before favoriting a prompt");
            return;
        }

        const isFav = favoriteID.includes(promptId);

        try {
            if (isFav) {
                await axios.delete(`/api/favorites/${promptId}`);
                setFavoritesID(favoriteID.filter((id) => id !== promptId));
            } else {
                // ส่ง field name ให้ตรงกับ API ที่รับ prompt_id
                await axios.post("/api/favorites", { prompt_id: promptId });
                setFavoritesID([...favoriteID, promptId]);
            }
        } catch (error) {
            console.log("Error toggling favorite:", error);
            toast.error("Failed to update favorite");
        }
    };

    const isFavorite = (promptId: number) => favoriteID.includes(promptId);

    return { favoriteID, loading, toggleFavorite, isFavorite };

};
