import { Show, createSignal } from "solid-js"
import FindCompany from "@/components/admin/find-comapny-popup"
import FindProduct from "@/components/admin/find-product-popup"
import CreateProductPopup from "@/components/admin/create-product-popup"
import EditProductPopup, { FULL_PACKAGE } from "@/components/admin/edit-product-popup"
import LoadPopup from "@/components/load-popup"
import { API_URL } from "@/util/base-url"
import { AlertStore } from "@/components/stores/alert-store"


export default function Site() {
    const [findCompanyPopup, setFindCompanyPopup] = createSignal(false)
    const [findProductPopup, setFindProductPopup] = createSignal(false)
    const [createProductPopup, setCreateProductPopup] = createSignal(false)
    const [selectedProduct, setSelectedProduct] = createSignal<null | FULL_PACKAGE>(null)
    const [loading, setLoading] = createSignal<null | {Text: string}>(null)

    return (<>
        <Show when={loading()}>
            <LoadPopup Text={loading()!.Text} />
        </Show>

        <button class="border p-5" onclick={() => setFindCompanyPopup(true)}>Finn et firma</button>
        <Show when={findCompanyPopup()}>
            <FindCompany onExit={() => setFindCompanyPopup(false)} />
        </Show>
        <button class="border p-5" onclick={() => setFindProductPopup(true)}>Finn et produkt</button>

        <Show when={findProductPopup()}>
            <FindProduct onExit={() => setFindProductPopup(false)} onProductSelect={async (pageData) => {
                setFindProductPopup(false)
                setLoading({ Text: "Henter produktet... Vent litt." })
                const res = fetch(`${API_URL}/product/search/${pageData.id}`)
                    .then((res) => res.json())
                    .then((res) => res.company)
                
                res
                    .then((res) => {
                        setSelectedProduct(res)
                        setFindCompanyPopup(false)
                    })
                    .catch((err) => {
                        console.error(err)
                        AlertStore.set({
                            type: "error",
                            list: ["Kunne ikke hente produktet.", `ID: ${pageData.id} - ${err}`],
                            title: "Error",
                            visible: {
                                enable: true,
                                timeout: 5000,
                            },
                        })
                        setFindCompanyPopup(true)
                    })
                    .finally(() => {
                        setLoading(null)
                    })

            }} />    
        </Show>

        <button class="border p-5" onclick={() => setCreateProductPopup(true)}>Lag et produkt</button>
        <Show when={createProductPopup()}>
            <CreateProductPopup onExit={() => setCreateProductPopup(false)} />
        </Show>

        <Show when={selectedProduct()}>
            <EditProductPopup data={selectedProduct()!} onExit={() => {
                setSelectedProduct(null)
            }}/>
        </Show>

    </>)
}
