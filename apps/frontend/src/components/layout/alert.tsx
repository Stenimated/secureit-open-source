import { useStore } from "@nanostores/solid"
import { Match, Show, Switch, createEffect } from "solid-js"
import { twMerge } from "tailwind-merge"
import { AiOutlineInfoCircle } from 'solid-icons/ai'
import { BiRegularError } from 'solid-icons/bi'
import { FaRegularCircleCheck } from 'solid-icons/fa'
import { AiOutlineClose } from 'solid-icons/ai'
import { AlertProps, AlertPropsError, AlertStore } from "@/components/stores/alert-store"

export default function Alert() {
    const store = useStore(AlertStore);

    const colorVarient: Record<AlertProps["type"], {
        darker: string,
        default: string,
        text: string
    }> = {
        info: {
            darker: "bg-blue-200",
            default: "bg-blue-100",
            text: "text-blue-900",
        },
        success: {
            darker: "bg-green-200",
            default: "bg-green-100",
            text: "text-green-900",
        },
        error: {
            darker: "bg-red-200",
            default: "bg-red-100",
            text: "text-red-900",
        },
        warning: {
            darker: "bg-yellow-200",
            default: "bg-yellow-100",
            text: "text-yellow-900",
        },
    }

    const defaultText: Record<AlertProps["type"], string> = {
        info: "Information",
        error: "Opoos! Something went wrong!",
        success: "Success!",
        warning: "Warning!",
    }
    const onClickClose = () => {
        AlertStore.setKey("visible", { enable: false})
    }

    let time: NodeJS.Timeout
    createEffect(() => {
        if (time) clearTimeout(time)

        const visible = store().visible.enable
        const timeout = store().visible.timeout

        if (visible && timeout) { 
            time = setTimeout(() => {
                onClickClose()
            }, timeout)
        }
    })


    
    return <Show when={store().visible.enable}>
        {/*  */}
        <div class="absolute w-full flex justify-center items-center top-[3.7rem] z-50" >
            <div 
                class={
                    twMerge(
                        colorVarient[store().type].default,
                        "flex w-[50rem] p-3 mx-5 gap-2 rounded-sm",
                    )
                }
            >
                {/* Icon */}
                <div class="w-10 h-full flex justify-center pt-1.5 ">
                    <Switch>
                        <Match when={store().type === "info"}>
                            <AiOutlineInfoCircle />
                        </Match>
                        <Match when={store().type === "success"}>
                            <FaRegularCircleCheck />
                        </Match>
                        <Match when={store().type === "error"}>
                            <BiRegularError />
                        </Match>
                        <Match when={store().type === "warning"}>
                            <BiRegularError />
                        </Match>
                    </Switch>
                </div>
                {/* Content */}
                <div class="flex flex-col w-full break-words text-clip overflow-clip">
                    {/* Title */}
                    <h4 class="text-xl font-medium">
                        {store().title ?? defaultText[store().type]}
                    </h4>
                    {/* Description */}
                    <Show when={store().description !== undefined} >
                        <p>{store().description}</p>
                    </Show>

                    {/* List */}
                    <Show when={Object.hasOwn(store(), "list") === true} >
                        <ul class="list-disc list-inside">
                            {((store() as AlertPropsError).list).map((item) => <li>{item}</li>)}    
                        </ul>
                    </Show>
                </div>

                {/* Close */}
                <div class="w-12 h-full flex justify-center pt-0">
                    <button title="close" class={twMerge(
                        colorVarient[store().type].text,
                        colorVarient[store().type].darker,
                        ` p-2 rounded-md bg-opacity-0 hover:bg-opacity-40`
                    )} onclick={onClickClose}>
                        <AiOutlineClose />
                    </button>
                </div>
            </div>
        </div>
    </Show>
}