import { For, Show, createSignal } from "solid-js"
import { RiSystemArrowDropDownFill } from 'solid-icons/ri'

type Item = {
    name: string;
    slug: string;
};

export default function DropdownAdminDashboard(props: {
    data: { name: string } & ({type: "multi", items: Item[] } | {type: "single", link: string })
}) { 
    const [open, setOpen] = createSignal(false)
  
    return (
        <div class="mt-5">
            <Show when={props.data.type === "multi" && props.data.items.length > 0} fallback={
                <a class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-900/80 flex justify-between" href={props.data.type === "single" && props.data.link || "#"} >
                    {props.data.name}
                </a>
            }>
                 <button class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-900/80 flex justify-between" onclick={() => setOpen(!open())}>
                    <div>{props.data.name}</div>

                    <RiSystemArrowDropDownFill  />
                </button>
            </Show>
           

            <Show when={open()}>
                <div class="space-y-1">
                    <For each={props.data.type === "multi" && props.data.items}>
                        {(item) => (
                            <a
                                href={item.slug}
                                class={
                                    "block rounded-md px-3 py-2 text-sm font-medium hover:text-gray-800"
                                }
                            >
                            {item.name}
                        </a>
                        )}
                    </For>
                </div>
            </Show>
        </div>
    )
}