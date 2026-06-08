import { useUserStore } from "@/store/userStore";
import { useUser } from "@clerk/expo";
import { useEffect } from "react";
import { useSupabase } from "./useSupabase";

export const useUserSync = () => {
  const { user, isLoaded } = useUser();
  const setIsAdmin = useUserStore((state) => state.satIsAdmin);
  const authSupabase = useSupabase();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const email = user.emailAddresses?.[0]?.emailAddress;
    if (!email) return;

    syncUser();
  }, [isLoaded, user]);

  const syncUser = async () => {
    // Use maybeSingle() — won't throw an error when no row is found
    const { data, error: selectError } = await authSupabase
      .from("users")
      .select("clerk_id,is_admin")
      .eq("clerk_id", user?.id)
      .maybeSingle();

    if (selectError) {
      console.error("useUserSync: select error →", selectError.message);
      return;
    }

    if (data) {
      setIsAdmin(data.is_admin ?? false);
      return;
    }

    // User doesn't exist — insert them
    const { data: newUser, error: insertError } = await authSupabase
      .from("users")
      .insert({
        clerk_id: user?.id,
        email: user?.emailAddresses?.[0]?.emailAddress,
        first_name: user?.firstName ?? "",
        last_name: user?.lastName ?? "",
        avatar_url: user?.imageUrl ?? "",
      })
      .select("is_admin")
      .maybeSingle();

    if (insertError) {
      console.error("useUserSync: insert error →", insertError.message);
      return;
    }

    setIsAdmin(newUser?.is_admin ?? false);
  };
};
