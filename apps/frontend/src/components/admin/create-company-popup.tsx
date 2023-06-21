import Popup from "@/components/popup";
import { AlertStore } from "@/components/stores/alert-store";
import { API_URL } from "@/util/base-url";
import type { Company } from "database";
import { createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import LoadingSpinner from "@/components/loading-spinner"

export default function CreateCompanyPopup(props: {
  onExit: () => void;
}) {
  const [state, setState] = createStore<
    Omit<Company, "createdAt" | "updatedAt" | "image_id" | "logo" | "id">
  >({
    email: "",
    address: "",
    city: "",
    country: "",
    name: "",
    phone: "",
    website: "",
    state: "",
    zip: "",
  });
  const [loading, setLoading] = createSignal(false);
  const elements: Array<keyof typeof state> = [
    "email",
    "address",
    "city",
    "country",
    "name",
    "phone",
    "website",
    "state",
    "zip",
  ];

  const onSubmit = (e: Event) => {
    e.preventDefault();
    if (loading()) return;

    const missing: string[] = []
    for (const index of Object.keys(state)) { 
      const value = state[index as keyof typeof state]  
      if (value.toString().trim() == "") {
            missing.push(index)
        }
    }

    if (missing.length > 0) { 
          AlertStore.set({
            type: "error",
              list: missing,
              title: "Missing fields",
              visible: {
                enable: true,
                  timeout: 5000
              }
        })
        return
    }
    
    setLoading(true);

    return fetch(`${API_URL}/company`, {
      body: JSON.stringify(state),
      headers: {
        "Accept": "applicaiton/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      redirect: "follow",
      cache: "no-cache",
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
            },
          });
        } else {
            window.location.reload()
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <Popup onExit={props.onExit}>
      <div class="w-full h-full bg-white border p-5 overflow-y-auto rounded-lg">
      <form class="space-y-5" onSubmit={onSubmit}>
        <For each={elements}>
          {(item) => 
            <div>
              <p class="text-gray-80 font-medium translate-x-1">{item}</p>
              <input
                type="text"
                name={item}
                title={item}
                class="w-full h-12 border border-gray-100 shadow rounded-md p-5 focus:border-blue-500"
                onInput={(e) => {
                  setState({
                    [item]: (e.target as HTMLInputElement).value,
                  });
                  }}
                  ref={(e) => e.focus({
                    preventScroll: true
                  })}
              />
            </div>
          }
          </For>
            <button title="Submit" type="submit" class="w-full h-12 bg-blue-600 text-white text-center font-medium">
              <Show when={loading() == true} fallback={"Continue"}>
                  <LoadingSpinner  />
              </Show>
          </button>
      </form>
      </div>

    </Popup>
  );
}
