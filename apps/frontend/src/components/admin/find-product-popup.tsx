import Popup from "@/components/popup";
import { API_URL } from "@/util/base-url";
import { createResource, createSignal, For } from "solid-js";

const fetchCompanies = async (value: string): Promise<Array<{
    name: string,
    id: string,
    logo: string,
}>> => { 
    return fetch(`${API_URL}/product/search?q=${value}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
          return data;
      })
}

export default function FindProduct(props: {
  onExit: () => void;
  onProductSelect?: (product: { name: string, id: string, logo: string }) => void;
}) {
  const [search, setSearch] = createSignal("");
  const [results] = createResource(search, fetchCompanies);
    
  return (
    <Popup onExit={props.onExit}>
      <div class="w-full h-full bg-white border p-5 overflow-y-auto rounded-lg">
        <div>
          <h3>Search</h3>
        </div>

        <div class="w-full rounded-full p-3">
          <input
            type="text"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
          />
        </div>

        <div class="flex flex-col max-h-[30rem] w-full overflow-y-auto space-y-5">
          <For each={results()}>
            {(result) => <button class="flex flex-row space-x-5 h-10 hover:bg-slate-50" onClick={() => {
              if (props.onProductSelect) { 
                props.onProductSelect(result);
              }
                }}>
                    <img src={result.logo} title="logo" width={20} height={20} class="max-h-full w-auto" />
                    <p>Name: {result.name}</p>
                    <p>ID: {result.id}</p>
                </button>}
          </For>
        </div>
      </div>
    </Popup>
  );
}
