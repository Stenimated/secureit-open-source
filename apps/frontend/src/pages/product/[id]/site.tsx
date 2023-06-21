import Popup from "@/components/popup";
import type {
  Company,
  PDFProduct,
  ProductImage,
  ProductPage,
  ProductPageI18,
  Video,
} from "database";
import { createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { twMerge } from "tailwind-merge";

export type FULL_PACKAGE = ProductPage & {
  product_page_i18: (ProductPageI18 & {
    longLanguage?: string;
  })[];
  pdfs: PDFProduct[];
  video: Video[];
  images: ProductImage[];
  company: Company;
};


export default function ProductSite(
  props: { data: FULL_PACKAGE },
) {
  const [filter, setFilter] = createStore({
    sikkhethetsblad: false,
    datablad: false,
    andre: false,
  });
  const [view, setView] = createSignal<(Video & { src: string }) | null>(null);
  const [viewPdf, setViewPdf] = createSignal<PDFProduct | null>(null);
  const [phoneFilterActive, setPhoneFilterActive] = createSignal(false)

  return (
    <div class="flex justify-start flex-col sm:w-[40rem] w-full mt-10 space-y-3">
      <Show when={view()}>
        <Popup onExit={() => setView(null)}>
          <iframe
            src={view()!.src}
            allow="autoplay; encrypted-media"
            allowfullscreen
            class={"w-full h-[40rem]"}
          >
          </iframe>
        </Popup>
      </Show>

      <Show when={viewPdf()}>
        <Popup onExit={() => setViewPdf(null)}>
          <object
            data={"/pdf.pdf"}
            type="application/pdf"
            width="100%"
            height="800px"
          >
          </object>
        </Popup>
      </Show>
      <div class="h-px w-full bg-gray-200"></div>

      <h3 class="text-2xl">Videos</h3>
      {/* content */}
      <div class="flex flex-row gap-10 justify-start">
        <For
          each={props.data.video}
        >
          {(video) => {
            {/* format "youtu.be/sFODclG8mBY" */}
            const id = video.url.split("/")[1];
            const url = `https://img.youtube.com/vi/${id}/default.jpg`;

            return (
              <div
                class="h-52 w-40 bg-slate-100 drop-shadow-lg overflow-hidden"
                onClick={() => {
                  setView({
                    ...video,
                    src: `https://www.youtube.com/embed/${id}`,
                  });
                }}
              >
                <p class="text-center text-">
                  {video.title}
                </p>
                <img
                  src={url}
                  alt="Video icon"
                  class="h-full w-full object-cover px-2 pb-2 "
                />
              </div>
            );
          }}
        </For>
      </div>


      <div class="h-px w-full bg-gray-200"></div>

      <h3 class="text-2xl">PDF</h3>
      {/* Filter */}

        <button class="p-2 px-4 w-full bg-slate-200 border" onClick={() => setPhoneFilterActive(!phoneFilterActive())}>
            Filters +
        </button>

         <Show when={phoneFilterActive()}>
          <div class="w-full bg-slate-50">
            <For each={[
              {
                name: "Sikkerhetsblad",
                value: props.data.pdfs.filter((v) => v.type === "DATA_SHEET").length,
                onClick: () =>
                  setFilter({
                    sikkhethetsblad: !filter.sikkhethetsblad,
                  }),
                  active: filter.sikkhethetsblad
              },
              {
                name: "Datablad",
                value: props.data.pdfs.filter((v) => v.type === "MANUAL").length,
                onClick: () =>
                  setFilter({
                    datablad: !filter.datablad,
                  }),
                active: filter.datablad
                
              },
              {
                name: "Andre",
                value: props.data.pdfs.filter((v) => v.type === "OTHER").length,
                onClick: () =>
                  setFilter({
                    andre: !filter.andre,
                  }),
                  active: filter.andre
              }
            ]}>
              {(filter, i) => (
                <button
                  class={twMerge(
                    "text-gray-900 p-2 px-3 w-full border-x",
                    filter.active ? "bg-blue-400 text-white" : "",
                  
                  )}
                  onClick={filter.onClick}
                >
                  {filter.name} {filter.value}
                </button>
              )}
            </For>
          </div>
       </Show>

     
      
      {/* content */}
      <div class="pt-5 flex justify-start flex-row space-x-5">
        <For
          each={props.data.pdfs.filter((v) =>
          {
            if (filter.sikkhethetsblad && v.type === "DATA_SHEET") return true;
            else if (filter.datablad && v.type === "MANUAL") return true;
            else if (filter.andre && v.type === "OTHER") return true;
            else if (filter.sikkhethetsblad === false && filter.datablad === false && filter.andre === false) return true;
            else return false;
            }
          )}
        >
          {(pdf) => (
            <div class="h-52 w-32 bg-slate-100 drop-shadow-lg">
              <a href={pdf.url} target="_blank" rel="noopener noreferrer">
                <p class="text-center">
                  {pdf.title}
                </p>
                <img
                  src={pdf.cover ?? ""}
                  alt="Video icon"
                  class="h-52 w-32 object-cover px-2 pb-2 "
                />
              </a>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
