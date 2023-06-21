import { Show } from "solid-js"
import { createStore } from "solid-js/store"
import LoadingSpinner from "@/components/loading-spinner"
import { API_URL } from "@/util/base-url"
import { AlertStore } from "@/components/stores/alert-store"

export default function LoginMenu() {
    const [state, setState] = createStore(({
        email: "",
        password: "",
        passwordConfirm: "",
        loading: false,
    }))

    const onSubmit = async (e: Event) => {
        e.preventDefault()

        if (state.loading) return
        if (state.password !== state.passwordConfirm) return

        setState({ loading: true })

        return fetch(`${API_URL}/auth/sign-up-local`, {
            method: "POST",
            body: JSON.stringify({
                email: state.email,
                password: state.password,
            }),
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "include", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json"
            },

        })
            .then((res) => res.json())
            .then((response) => {
                if (response.error || response.ok !== true) {
                    AlertStore.set({
                        type: "error",
                        title: "Error",
                        description: "Something went wrong",
                        visible: {
                            enable: true,
                            timeout: 10000,
                        }
                    })
                } else {
                    window.location.href = "/"
                }
                setState({ loading: false })
                console.log(response)
            }).catch((error) => {
                AlertStore.set({
                    type: "error",
                    title: "Error",
                    description: "Something went wrong",
                    visible: {
                        enable: true,
                        timeout: 10000,
                    }
                })
                console.error(error)
                setState({ loading: false })
            })
    }

    return (
        <div class="mt-16 w-[30rem] space-y-10 h-[50rem]">
            <h2 class=" text-3xl text-center">Sign up</h2>

            <form class="space-y-5" onSubmit={onSubmit}>
                <div>
                    <p class="text-gray-700 font-medium translate-x-1">Email</p>
                    <input type="email" name="" title="email" class="w-full h-12 border border-gray-100 shadow rounded-md p-5 focus:border-blue-500" onInput={(e) => {
                        const target = e.target as HTMLInputElement
                        setState({ email: target.value })
                    }} />
                </div>
                <div>
                    <p class="text-gray-700 font-medium translate-x-1">Password</p>
                    <input type="password" name="" title="password" class="w-full h-12 border border-gray-100 shadow rounded-md p-5 focus:border-blue-500"
                        onInput={(e) => {
                            const target = e.target as HTMLInputElement
                            setState({ password: target.value })
                        }}
                    />
                </div>

                <div>
                    <p class="text-gray-700 font-medium translate-x-1">Password Confirmation</p>
                    <input type="password" name="" title="password-confirmation" class="w-full h-12 border border-gray-100 shadow rounded-md p-5 focus:border-blue-500"
                        onInput={(e) => {
                            const target = e.target as HTMLInputElement
                            setState({ passwordConfirm: target.value })
                        }}
                    />
                </div>



                <button title="Submit" type="submit" class="w-full h-12 bg-blue-600 text-white text-center font-medium">
                    <Show when={state.loading == true} fallback={"Continue"}>
                        <LoadingSpinner />
                    </Show>
                </button>
            </form>
        </div>
    )
}