import { Show, createSignal } from "solid-js"
import CreateCompanyPopup from "@/components/admin/create-company-popup"
import FindCompany from "@/components/admin/find-comapny-popup"

export default function Site() {
    const [createCompanyPopup, setCreateCompanyPopup] = createSignal(false)
    const [findCompanyPopup, setFindCompanyPopup] = createSignal(false)

    return (<>
        <button class="border p-5" onclick={() => setCreateCompanyPopup(true)}>Lag en firma</button>
        <Show when={createCompanyPopup()}>
            <CreateCompanyPopup onExit={() => setCreateCompanyPopup(false)} />
        </Show>
        <button class="border p-5" onclick={() => setFindCompanyPopup(true)}>Finn et firma</button>
        <Show when={findCompanyPopup()}>
            <FindCompany onExit={() => setFindCompanyPopup(false)} />
        </Show>
    </>)
}
