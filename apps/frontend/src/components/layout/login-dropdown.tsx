
import { Show, createEffect, createSignal } from "solid-js"
import { API_URL } from "@/util/base-url"
import LoadingSpinner from "@/components/loading-spinner"
import { useStore } from "@nanostores/solid"
import { AuthStore } from "../stores/auth-store"


export default function LoginDropdown() { 
    const [open, setOpen] = createSignal(false)
    const [loading, setLoading] = createSignal(false)
    const authentication = useStore(AuthStore)

    const signout = () => {
        if (loading()) return;
        setLoading(true)
        fetch(`${API_URL}/auth/sign-out`, {
            method: "POST",
            credentials: "include",
            redirect: "follow",
        })
            .then((res) => res.json())
            .then((response) => { 
                if (response.success) {
                    window.location.reload()
                } else {
                    throw new Error(response.message ?? "Something went wrong")
                }
            })
            .catch((error) => { 
                console.error(error)
            })
        .finally(() => { 
            setLoading(false)
        })
    }

    return (
        <div class="flex justify-center flex-row">
            <button onclick={() => setOpen(!open())} class="h-full w-12 flex justify-center items-center">
                <img src={
                    authentication()?.image ?? "/image/empty-user.png"
                } alt="profile" height={32} width={32} class="rounded-xl" />
             </button>
            <Show when={open()}>
                <div class="absolute translate-x-[-4rem] mt-11 w-48 bg-white shadow-xl py-1 border">
                    <Show when={authentication()} fallback={
                        <a href="/login" class="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 ">
                            Logg in
                        </a>
                    }>
                        <button class="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 " onClick={signout}>
                            Logg out
                            <Show when={loading() === true}>
                                <LoadingSpinner />
                            </Show>
                        </button>
                    </Show>

                    <Show when={authentication()?.role === "ADMIN" || authentication()?.role === "EMPLOYEE"}>
                        <hr class="border-t border-gray-100" />
                        <a href="/employee" class="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 ">Admin</a>
                    </Show>
                </div>
            </Show>
        </div>
    )

}