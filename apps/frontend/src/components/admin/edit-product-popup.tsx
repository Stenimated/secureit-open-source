import Popup from "@/components/popup";
import type {
  Company,
  PDFProduct,
  ProductImage,
  ProductPage,
  ProductPageI18,
  Video,
} from "database";
import {
  createResource,
  createSignal,
  For,
  Match,
  Show,
  Switch,
} from "solid-js";
import { createStore } from "solid-js/store";
import LoadPopup from "../load-popup";
import { AlertStore } from "../stores/alert-store";
import { API_URL } from "@/util/base-url";

export type FULL_PACKAGE = ProductPage & {
  product_page_i18: ProductPageI18[];
  pdfs: PDFProduct[];
  video: Video[];
  images: ProductImage[];
  company: Company;
};

const EditDetails = (data: { data: FULL_PACKAGE }) => {
  const [search, setSearch] = createSignal<string>("");

  const [filtered] = createResource(search, (search) => {
    return data.data.product_page_i18
      .filter((i18) =>
        i18.title.toLowerCase().includes(search.toLowerCase()) ||
        i18.description.toLowerCase().includes(search.toLowerCase()) ||
        i18.language.toLowerCase().includes(search.toLowerCase())
      );
  });

  const [i18Create, setI18Create] = createStore<
    Omit<ProductPageI18, "id" | "updatedAt" | "createdAt" | "product_page_id">
  >({
    title: "",
    description: "",
    language: "",
  });

  const [isLoaded, setIsLoaded] = createSignal({
    bool: false,
    text: "Loading...",
  });

  const onCreateI18 = (e: Event) => {
    e.preventDefault();

    if (
      i18Create.title === "" || i18Create.description === "" ||
      i18Create.language === ""
    ) {
      AlertStore.set({
        type: "error",
        list: ["Du må fylle ut alle feltene."],
        title: "Error",
        visible: {
          enable: true,
          timeout: 5000,
        },
      });
      return;
    }

    if (isLoaded().bool) return;
    setIsLoaded({ bool: true, text: "Creating..." });

    fetch(`${API_URL}/product/i18/${data.data.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(i18Create),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) {
          AlertStore.set({
            type: "success",
            list: ["Språk side ble opprettet."],
            title: "Success",
            visible: {
              enable: true,
              timeout: 5000,
            },
          });

          setI18Create({
            title: "",
            description: "",
            language: "",
          });

          data.data.product_page_i18.push(res.page);
        } else {
          throw new Error("Noe gikk galt, prøv igjen.");
        }
      })
      .catch((err) => {
        console.error(err);
        AlertStore.set({
          type: "error",
          list: ["Noe gikk galt, prøv igjen."],
          title: "Error",
          visible: {
            enable: true,
            timeout: 5000,
          },
        });
      })
      .finally(() => setIsLoaded({ bool: false, text: "Loading..." }));
  };

  return (
    <div class="flex justify-center flex-col  text-center mt-5 space-y-3">
      <Show when={isLoaded().bool}>
        <LoadPopup Text={isLoaded().text} />
      </Show>
      <div>
        <p>Edit Product name</p>
        <input
          type="text"
          innerText={data.data.name}
          placeholder="name"
          class="border w-full"
        />

        <button class="p-3 border bg-green-600 text-white">
          Lagre nytt navn
        </button>
      </div>

      <div class="w-full h-px bg-slate-100" />

      <div>
        <p>Create i18/Språk side</p>

        <form onSubmit={onCreateI18} class="flex flex-col">
          <p>Title</p>
          <input
            type="text"
            placeholder="Title"
            class="border"
            onInput={(e) => {
              setI18Create({
                title: e.target.value,
              });
            }}
          />
          <p>Description</p>
          <input
            type="text"
            placeholder="Description"
            class="border"
            onInput={(e) => {
              setI18Create({
                description: e.target.value,
              });
            }}
          />
          <p>
            Vær oops at språket må stå på denne siden!{" "}
            <a href="https://www.ethnologue.com/">
              https://www.ethnologue.com/
            </a>{" "}
            ellers så funker det ikke!
          </p>
          <p>Eks Norwegian er "nor"</p>
          <input
            type="text"
            placeholder="Language"
            onInput={(e) => {
              setI18Create({
                language: e.target.value,
              });
            }}
          />

          <button
            class="p-3 border bg-green-600 text-white"
            onSubmit={onCreateI18}
          >
            Lagre
          </button>
        </form>
      </div>

      <div class="w-full h-px bg-slate-100" />

      <div class="max-h-[30rem] overflow-x-auto flex justify-center flex-col">
        <h2>Languages</h2>
        <input
          type="text"
          placeholder="Search"
          onInput={(e) => setSearch(e.target.value)}
          class="border"
        />

        <div class="flex justify-center flex-col">
          <Show
            when={filtered()!.length > 0}
            fallback={
              <tr>
                <td colspan={3}>No results</td>
              </tr>
            }
          >
            <For each={filtered()!}>
              {(i18) => (
                <tr class="border">
                  <td>Title: {i18.title}</td>
                  <td>Description: {i18.description}</td>
                  <td>Lang: {i18.language}</td>
                </tr>
              )}
            </For>
          </Show>
        </div>
      </div>
    </div>
  );
};

const EditVideo = (data: { data: FULL_PACKAGE }) => {
  const [videoCreate, setVideoCreate] = createStore<
    Omit<Video, "id" | "createdAt" | "updatedAt" | "product_page_id">
  >({
    title: "",
    url: "",
    language: "",
  });

  const [isLoaded, setIsLoaded] = createSignal<{ bool: boolean; text: string }>(
    {
      bool: false,
      text: "Loading...",
    },
  );

  const onCreateVideo = (e: Event) => {
    e.preventDefault();

    if (
      videoCreate.title === "" || videoCreate.url === "" ||
      videoCreate.language === ""
    ) {
      AlertStore.set({
        type: "error",
        list: ["Alle feltene må fylles ut."],
        title: "Error",
        visible: {
          enable: true,
          timeout: 5000,
        },
      });
      return;
    }

    if (
      !videoCreate.url.includes("youtube.com") &&
      !videoCreate.url.includes("youtu.be")
    ) {
      AlertStore.set({
        type: "error",
        list: ["Du må legge inn en youtube link."],
        title: "Error",
        visible: {
          enable: true,
          timeout: 5000,
        },
      });
    }

    // format into youtu.be
    // by exacting the id from the url

    let id = `youtu.be/${
      (videoCreate.url.includes("youtube.com")
        ? videoCreate.url.split("v=")[1]
        : videoCreate.url.split("youtu.be/")[1])?.split("&")[0]
    }`;

    setIsLoaded({ bool: true, text: "Loading..." });

    fetch(`${API_URL}/product/video/${data.data.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: videoCreate.title,
        url: id,
        language: videoCreate.language,
      }),
      credentials: "include",
    }).then((res) => res.json())
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.error);
        }

        AlertStore.set({
          type: "success",
          list: ["Video lagt til."],
          title: "Success",
          visible: {
            enable: true,
            timeout: 5000,
          },
        });
      }).catch((err) => {
        AlertStore.set({
          type: "error",
          list: [err.message],
          title: "Error",
          visible: {
            enable: true,
            timeout: 5000,
          },
        });
      }).finally(() => {
        setIsLoaded({ bool: false, text: "" });
      });
  };

  return (
    <div>
      <Show when={isLoaded().bool}>
        <LoadPopup Text={isLoaded().text} />
      </Show>

      <p>Video</p>

      <div class="w-full h-px bg-slate-100" />

      <h3>Lag video</h3>

      <form>
        <p>title</p>
        <input
          type="text"
          placeholder="Title"
          class="border"
          onInput={(e) => {
            setVideoCreate({
              title: e.target.value,
            });
          }}
        />
        <p>youtube video</p>
        <input
          type="text"
          placeholder="youtube-link"
          class="border"
          onInput={(e) => {
            setVideoCreate({
              url: e.target.value,
            });
          }}
        />
        <p>Språk kode</p>
        <input
          type="text"
          placeholder="language"
          class="border"
          onInput={(e) => {
            setVideoCreate({
              language: e.target.value,
            });
          }}
        />

        <button class="p-5 border" onClick={onCreateVideo}>Submit</button>
      </form>

      <div class="w-full h-px bg-slate-100" />

      <div class="flex justify-center flex-col  text-center mt-5 space-y-3">
        <For each={data.data.video}>
          {(video) => (
            <div class="flex justify-center flex-col  text-center mt-5 space-y-3">
              <a href={`https://${video.url}`}>
                CODE: {video.language} {video.id}
              </a>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

const EditImages = (data: { data: FULL_PACKAGE }) => {
  const [isLoaded, setIsLoaded] = createSignal<{ bool: boolean; text: string }>(
    {
      bool: false,
      text: "Loading...",
    },
  );
  const [store, setStore] = createStore<{ order: number, file: File | null }>({
    order: 0,
    file: null,
  });

  const onSubmit = (e: Event) => {
    e.preventDefault();

    if (store.file === null) { 
      AlertStore.set({
        type: "error",
        list: ["Du må velge et bilde."],
        title: "Error",
        visible: {
          enable: true,
          timeout: 5000,
        },
      });
      return
    }

    setIsLoaded({ bool: true, text: "Loading..." });

    const formData = new FormData();
    formData.append("order", store.order.toString());
    formData.append("image", store.file);

    fetch(`${API_URL}/product/image/${data.data.id}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    }).then((res) => res.json())
      .then((res) => { 
        if (!res.ok) { 
          throw new Error(res.error);
        }

        AlertStore.set({
          type: "success",
          list: ["Bilde lagt til."],
          title: "Success",
          visible: {
            enable: true,
            timeout: 5000,
          },
        })
      }).catch((err) => {
        AlertStore.set({
          type: "error",
          list: [err.message],
          title: "Error",
          visible: {
            enable: true,
            timeout: 5000,
          },
        });
      }).finally(() => {
        setIsLoaded({ bool: false, text: "" });
      })
  };

  return (
    <div>
      <p>Images</p>

      <Show when={isLoaded().bool}>
        <LoadPopup Text={isLoaded().text} />
      </Show>

      <div class="flex justify-center flex-col  text-center mt-5 space-y-3">
        <div class="w-full h-px bg-slate-100" />

        <form onSubmit={onSubmit}>
          <p>order</p>
          <input
            type="number"
            onInput={(e) => {
              setStore({
                order: parseInt(e.target.value),
              });
            }}
            title="order"
          />

          <p>Image</p>
          <input type="file" name="image" title="image" accept="image/png, image/jpeg" onInput={(e) => {
            if (e.target.files && e.target.files[0]) {
              setStore({
                file: e.target.files[0],
              })
            }
          }} />

          <button class="p-5 border" type="submit">Submit</button>
        </form>

        <div class="w-full h-px bg-slate-100" />

        <For each={data.data.images.sort((a, b) => a.order - b.order)}>
          {(image) => (
            <div>
              <img
                src={image.url}
                width={50}
                height={50}
                class="w-12 h-auto"
                title="icon"
              />
              <p>PRIORTIY: {image.order} {image.id}</p>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

const EditPDF = (data: { data: FULL_PACKAGE }) => {
  const [isLoaded, setIsLoaded] = createSignal<{ bool: boolean; text: string }>(
    {
      bool: false,
      text: "Loading...",
    },
  );
  const [store, setStore] = createStore<Omit<PDFProduct, "id" | "url" | "cover" | "createdAt" | "updatedAt" | "image_id" | "image"> & {
    file: File | null;
    cover: File | null;
  }>({
    language: "",
    title: "",
    type: "DATA_SHEET",
    file: null,
    cover: null,
    product_page_id: data.data.id,
  });

  const onSubmit = (e: Event) => {
    e.preventDefault();

    if (store.file === null) { 
      AlertStore.set({
        type: "error",
        list: ["Du må velge et pdf."],
        title: "Error",
        visible: {
          enable: true,
          timeout: 5000,
        },
      });
      return
    }

    if (store.cover === null) { 
      AlertStore.set({
        type: "error",
        list: ["Du må velge et cover."],
        title: "Error",
        visible: {
          enable: true,
          timeout: 5000,
        }
      })
    }

    if (
      store.language === "" ||
      store.title === "" ||
      (store.type as string) === ""
    ) {
      AlertStore.set({
        type: "error",

        list: ["Du må fylle ut alle feltene."],
        title: "Error",
        visible: {
          enable: true,
          timeout: 5000,
        },
      })
    }

    setIsLoaded({ bool: true, text: "Loading..." });

    const formData = new FormData();
    formData.append("language", store.language);
    formData.append("title", store.title);
    formData.append("type", store.type);
    formData.append("pdf", store.file);
    formData.append("cover", store.cover!);
    formData.append("product_page_id", store.product_page_id.toString());


    fetch(`${API_URL}/product/pdf/${data.data.id}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    }).then((res) => res.json())
      .then((res) => { 
        if (!res.ok) { 
          throw new Error(res.error);
        }

        AlertStore.set({
          type: "success",
          list: ["Bilde lagt til."],
          title: "Success",
          visible: {
            enable: true,
            timeout: 5000,
          },
        })
      }).catch((err) => {
        AlertStore.set({
          type: "error",
          list: [err.message],
          title: "Error",
          visible: {
            enable: true,
            timeout: 5000,
          },
        });
      }).finally(() => {
        setIsLoaded({ bool: false, text: "" });
      })
  };

  return (
    <div>
      <p>PDFS</p>

      <Show when={isLoaded().bool}>
        <LoadPopup Text={isLoaded().text} />
      </Show>

      <div class="flex justify-center flex-col  text-center mt-5 space-y-3">
        <div class="w-full h-px bg-slate-100" />

        <form onSubmit={onSubmit}>
          <p>title</p>
          <input
            type="text"
            onInput={(e) => {
              setStore({
                title: e.target.value,
              })
            }}
            title="title"
          class="border" />

          <p>språk kode</p>
          <input
            type="text"
            onInput={(e) => { 
              setStore({
                language: e.target.value,
              })
            }}
            title="language"
          class="border" />

          <p>type</p>
          <select
            onInput={(e) => {
              setStore({
                type: e.target.value as PDFProduct["type"],
              })
            }}
            title="type" class="border"
          >
            <option value="DATA_SHEET">Data Sheet</option>
            <option value="MANUAL">User Manual</option>
            <option value="OTHER">Other</option>
          </select>
          
          

          <p>PDF-FILE</p>
          <input type="file" name="image" title="image" accept="application/pdf" onInput={(e) => {
            if (e.target.files && e.target.files[0]) {
              setStore({
                file: e.target.files[0],
              })
            }
          }} class="border"/>

          <p>PDF-COVER</p>
          <input type="file" name="image" title="image" accept="image/png, image/jpeg" onInput={(e) => {
            if (e.target.files && e.target.files[0]) {
              setStore({
                cover: e.target.files[0],
              })
            }
          }} class="border"/>

          
          <button class="p-5 border" type="submit">Submit</button>
        </form>

        <div class="w-full h-px bg-slate-100" />

        <For each={data.data.pdfs}>
          {(image) => (
            <div>
              <img
                src={image.image ?? ""}
                width={50}
                height={50}
                class="w-12 h-auto"
                title="icon"
              />
              <p>LANG: { image.language} : {image.title}</p>
            </div>
          )}
        </For>
      </div>
    </div>
  )
};

export default function CreateProductPopup(props: {
  onExit: () => void;
  data: FULL_PACKAGE;
}) {
  enum PAGE {
    DETAILS,
    VIDEO,
    IMAGES,
    PDF,
  }
  const [page, setPage] = createSignal<PAGE>(PAGE.DETAILS);

  return (
    <Popup onExit={props.onExit}>
      <div class="p-10 bg-white">
        <h3>Edit Product</h3>
        <h3>Company: {props.data.company.name}</h3>
        <h3>Product-Name: {props.data.name}</h3>
        <h3>Total languages: {props.data.product_page_i18.length}</h3>
        <h3>Total PDFs: {props.data.pdfs.length}</h3>
        <h3>Total Videos: {props.data.video.length}</h3>
        <h3>Total Images: {props.data.images.length}</h3>
        <h3>ID { props.data.id}</h3>

        <button class="border p-5" onclick={() => setPage(PAGE.DETAILS)}>
          Edit Details
        </button>
        <button class="border p-5" onclick={() => setPage(PAGE.VIDEO)}>
          Edit Video
        </button>
        <button class="border p-5" onclick={() => setPage(PAGE.IMAGES)}>
          Edit Images
        </button>
        <button class="border p-5" onclick={() => setPage(PAGE.PDF)}>
          Edit PDF
        </button>

        <Switch>
          <Match when={page() === PAGE.DETAILS}>
            <EditDetails data={props.data} />
          </Match>
          <Match when={page() === PAGE.VIDEO}>
            <EditVideo data={props.data} />
          </Match>
          <Match when={page() === PAGE.IMAGES}>
            <EditImages data={props.data} />
          </Match>
          <Match when={page() === PAGE.PDF}>
            <EditPDF data={props.data} />
          </Match>
        </Switch>
      </div>
    </Popup>
  );
}
