import { atom } from "nanostores";
import type { User } from "database";
import { createEffect } from "solid-js";

export const AuthStore = atom<User | null | undefined>(null);

export default function AuthStoreComponent(props: {
  user: User | null | undefined;
}) {
  createEffect(() => {
    AuthStore.set(props.user);
  });

  return null;
}
