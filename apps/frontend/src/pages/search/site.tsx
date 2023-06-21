import { API_URL } from "@/util/base-url"
import type { Branch, ProductImage } from "database"
import { For, createResource, createSignal } from "solid-js"
import { createStore } from "solid-js/store"
import { twMerge } from "tailwind-merge"

const BRANCHES = [
    {
        name: "Bygg",
        value: "BUILDING"
        },
        {
            name: "Helse",
           value: "MEDICAL"          
    },
    {
        name: "Andre",
        value: "OTHER"
    }
] satisfies Array<{
    name: string,
    value: Branch
}>

export interface SearchResult {
    name: string,
    id: number,
    images: [ProductImage | null]
}

const fetchProducts = async({ branch, query }: { branch: Branch | null, query: string }): Promise<SearchResult[]> => { 
    if (query.trim() == "") return Promise.resolve([])  
    
    const url = new URL(`${API_URL}/product/search`)
    url.searchParams.append("q", query)
    if (branch) url.searchParams.append("b", branch)

    return await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    })
        .then((res) => res.json())
}

export default function Site() {
    const [search, setSearch] = createSignal({
        branch: null,
        query: ""
    } satisfies {
        branch: Branch | null
        query: string
    })
    
    const [results] = createResource(search, fetchProducts)

    return (
        <div class="w-full h-full flex items-center pt-10 flex-col">
            <div class="flex items-center flex-col h-full md:w-[40rem] w-10/12">

                {/* Search bar */}
                <div class=" border rounded-full h-12 border-gray-400 w-full">
                    <input type="text" class="w-full h-full rounded-full p-5" placeholder="Søk etter produkter" onInput={(e) => {
                        setSearch({
                            ...search(),
                            query: e.target.value
                        })
                    }} />
                </div>

                {/* Filters */}

                <h4 class="w-full text-gray-400 text-center mt-3">Bransje</h4>
                <div class=" w-full pt-2 flex-wrap justify-center flex">
                    <For each={BRANCHES}>
                        {(value) => (
                            <button class={
                                twMerge(
                                    ["p-1 px-5 bg-slate-300 text-gray-500 border rounded-full mr-5 mb-2",
                                        value.value === search().branch ? "bg-blue-400 text-white" : ""
                                    ]
                                )
                            } onClick={() => 
                                setSearch({
                                    ...search(),
                                    branch: (search().branch === value.value ? null : value.value) as Branch | null as never
                                })
                            }>
                                {value.name}
                            </button>
                        )}
                    </For>
                </div>
                
                {/* Search resluts */}


                <h4 class="text-xl mt-3 w-full">Results</h4>
                <div class="w-full h-px bg-gray-300 mt-2" />

                <div class="flex w-full flex-row">
                    {
                        results()?.map((value) => {
                            return (
                                <a class="flex flex-col w-1/3" href={`/product/${value.id}`}>
                                    <div class="flex flex-col items-center">
                                        <img src={value.images[0]?.url ?? ""} class="h-40 w-40 object-contain" alt="img" />
                                        <p class="text-center">{value.name}</p>
                                    </div>
                                </a>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}