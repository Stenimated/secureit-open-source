import Popup from "@/components/popup";
import { AlertStore } from "@/components/stores/alert-store";
import { API_URL } from "@/util/base-url";
import type { ProductPage } from "database";
import { createSignal, Show } from "solid-js";
import { createStore } from "solid-js/store";
import LoadingSpinner from "@/components/loading-spinner";
import FindCompany from "./find-comapny-popup";

export default function CreateProductPopup(props: {
  onExit: () => void;
}) {
  const [state, setState] = createStore<
    Omit<ProductPage, "createdAt" | "updatedAt" | "id">
  >({
    company_id: "",
    name: "",
  });
  const [loading, setLoading] = createSignal(false);
  const [findCompany, setFindCompany] = createSignal(false);

  const onSubmit = (e: Event) => {
    e.preventDefault();
    if (loading()) return;

    const errors = [];

    if (state.name.trim() === "") {
      errors.push("name");
    }

    if (state.company_id.trim() === "") {
      errors.push("company_id");
    }

    if (errors.push() > 0) {
      AlertStore.set({
        type: "error",
        list: errors,
        title: "Missing fields",
        visible: {
          enable: true,
          timeout: 5000,
        },
      });
      return;
    }

    setLoading(true);

    return fetch(`${API_URL}/product`, {
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
          window.location.reload();
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Show when={findCompany()}>
        <FindCompany
          onExit={() => setFindCompany(false)}
          onCompanySelect={({ id }) => {
            setState({ company_id: id });
            setFindCompany(false);
          }}
        />
      </Show>
      <Show when={!findCompany()}>
        <Popup
          onExit={() => {
            if (findCompany() === false) {
              props.onExit();
            }
          }}
        >
          <div class="w-full h-full bg-white border p-5 overflow-y-auto rounded-lg">
            <form class="space-y-5" onSubmit={onSubmit}>
              <div>
                <p class="text-gray-80 font-medium translate-x-1">{"Name"}</p>
                <input
                  type="text"
                  name={"name"}
                  title={"name"}
                  class="w-full h-12 border border-gray-100 shadow rounded-md p-5 focus:border-blue-500"
                  onInput={(e) => {
                    setState({
                      name: (e.target as HTMLInputElement).value,
                    });
                  }}
                  ref={(e) =>
                    e.focus({
                      preventScroll: true,
                    })}
                />
                <button type="button" onClick={() => setFindCompany(true)}>
                  Find company {state.company_id}
                </button>
              </div>
              <button
                title="Submit"
                type="submit"
                class="w-full h-12 bg-blue-600 text-white text-center font-medium"
              >
                <Show when={loading() == true} fallback={"Continue"}>
                  <LoadingSpinner />
                </Show>
              </button>
            </form>
          </div>
        </Popup>
      </Show>
    </>
  );
}
