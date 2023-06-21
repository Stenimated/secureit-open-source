import { For, Show, createEffect, createSignal } from "solid-js"
import Popup from "./popup"


export default function SearchBarPopup(props: {
    enabled: boolean, onExit: () => void, fetch: () => Promise<Array<{
        title: string,
        description: string,
}>>}) { 
    const [search, setSearch] = createSignal("")
    const [results, setResults] = createSignal<Array<{
        title: string,
        description: string,
    }>>([])

    createEffect(() => { 
        if (search().length > 0) {
            props.fetch().then((data) => {
                setResults(data)
            })
        }
    })

    return <Show when={props.enabled}>
        <Popup onExit={props.onExit}>
            <div>
                <h3>Search</h3>
            </div>
            <div class="w-full rounded-full p-3">
                <input type="text" onChange={(e) => setSearch(e.target.value)} placeholder="Search" />
            </div>

            <div class="flex flex-col max-h-[30rem] w-full overflow-y-auto">
                <For each={results()}>
                    {(result) => <p>{result.title}</p>}
                </For>
            </div>
        </Popup>
    </Show>
}