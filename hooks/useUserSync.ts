import { useSupabase } from "@/hooks/useSupabase";
import { useUserStore } from "@/store/userStore";
import { useUser } from "@clerk/expo";
import { useCallback, useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";

export const useUserSync = () => {
  const { user } = useUser();
  const setIsAdmin = useUserStore((state) => state.setIsAdmin);
  const authSupabase = useSupabase();

  const syncUser = useCallback(async () => {
    if (!user) return;

    const { data } = await authSupabase
      .from("users")
      .select("clerk_id, is_admin")
      .eq("clerk_id", user.id)
      .single();

    if (data) {
      setIsAdmin(data.is_admin ?? false);
      return;
    }

    // First time — insert the user row
    const { data: newUser } = await authSupabase
      .from("users")
      .insert({
        clerk_id: user.id,
        email: user.emailAddresses[0].emailAddress,
        first_name: user.firstName,
        last_name: user.lastName,
        avatar_url: user.imageUrl,
      })
      .select("is_admin")
      .single();

    setIsAdmin(newUser?.is_admin ?? false);
  }, [user]);

  // 1. Run on mount / when user object changes
  useEffect(() => {
    syncUser();
  }, [syncUser]);

  // 2. Re-fetch whenever the app comes back to the foreground
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        syncUser();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [syncUser]);

  // 3. Realtime subscription — updates instantly when is_admin changes in DB
  useEffect(() => {
    if (!user) return;

    const channel = authSupabase
      .channel(`user-admin-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `clerk_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as { is_admin?: boolean };
          if (typeof updated.is_admin === "boolean") {
            setIsAdmin(updated.is_admin);
          }
        },
      )
      .subscribe();

    return () => {
      authSupabase.removeChannel(channel);
    };
  }, [user]);
};
