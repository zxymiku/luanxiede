import naturalSort from "typescript-natural-sort"
import { cookieStorage, createStorageSignal } from "@solid-primitives/storage"
import { createSignal } from "solid-js"
import { createStore, produce } from "solid-js/store"
import { Obj, StoreObj } from "~/types"
import { bus, log } from "~/utils"
import { keyPressed } from "./key-event"
import { local } from "./local_settings"

export enum State {
  Initial, // Initial state
  FetchingObj,
  FetchingObjs,
  FetchingMore,
  Folder, // Folder state
  File, // File state
  NeedPassword,
}

const [objStore, setObjStore] = createStore<{
  obj: Obj
  raw_url: string
  related: Obj[]

  objs: StoreObj[]
  total: number
  write?: boolean

  readme: string
  header: string
  provider: string
  // pageIndex: number;
  // pageSize: number;
  state: State
  err: string
}>({
  obj: {} as Obj,
  raw_url: "",
  related: [],

  objs: [],
  total: 0,

  readme: "",
  header: "",
  provider: "",
  // pageIndex: 1,
  // pageSize: 50,
  state: State.Initial,
  err: "",
})

const [selectedNum, setSelectedNum] = createSignal(0)

const setObjs = (objs: Obj[]) => {
  setSelectedNum(0)
  lastChecked = { index: -1, selected: false }
  setObjStore("objs", objs)
  setObjStore("obj", "is_dir", true)
}

export const ObjStore = {
  setObj: (obj: Obj) => {
    setObjStore("obj", obj)
  },
  setRawUrl: (raw_url: string) => {
    setObjStore("raw_url", raw_url)
  },
  setProvider: (provider: string) => {
    setObjStore("provider", provider)
  },
  setObjs: setObjs,
  setTotal: (total: number) => {
    setObjStore("total", total)
  },
  setReadme: (readme: string) => setObjStore("readme", readme),
  setHeader: (header: string) => setObjStore("header", header),
  setRelated: (related: Obj[]) => setObjStore("related", related),
  setWrite: (write: boolean) => setObjStore("write", write),
  // setGetResp: (resp: FsGetResp) => {
  //   setObjStore("obj", resp.data);
  //   setObjs(resp.data.related);
  //   setObjStore("readme", resp.data.readme);
  // },
  // setListResp: (resp: FsListResp) => {
  //   setObjs(resp.data.content);
  //   setObjStore("readme", resp.data.readme);
  //   setObjStore("write", resp.data.write);
  // },
  setState: (state: State) => setObjStore("state", state),
  setErr: (err: string) => setObjStore("err", err),
}

export type OrderBy = "name" | "size" | "modified"

export const sortObjs = (orderBy: OrderBy, reverse?: boolean) => {
  log("sort:", orderBy, reverse)
  setObjStore(
    "objs",
    produce((objs) =>
      objs.sort((a, b) => {
        return (reverse ? -1 : 1) * naturalSort(a[orderBy], b[orderBy])
      }),
    ),
  )
}

export const appendObjs = (objs: Obj[]) => {
  setObjStore(
    "objs",
    produce((prev) => prev.push(...objs)),
  )
}

let lastChecked = {
  index: -1,
  selected: false,
}

export const selectIndex = (index: number, checked: boolean, one?: boolean) => {
  if (
    keyPressed["Shift"] &&
    lastChecked.index !== -1 &&
    lastChecked.selected === checked
  ) {
    const start = Math.min(lastChecked.index, index)
    const end = Math.max(lastChecked.index, index)
    const curCheckedNum = objStore.objs
      .slice(start, end + 1)
      .filter((o) => o.selected).length

    setObjStore("objs", { from: start, to: end }, () => ({
      selected: checked,
    }))
    // update selected num
    const newSelectedNum =
      selectedNum() - curCheckedNum + (checked ? end - start + 1 : 0)
    setSelectedNum(newSelectedNum)
  } else {
    setObjStore(
      "objs",
      index,
      produce((obj) => {
        if (obj.selected !== checked) {
          setSelectedNum(checked ? selectedNum() + 1 : selectedNum() - 1)
        }
        obj.selected = checked
      }),
    )
  }
  lastChecked = { index, selected: checked }
  one && setSelectedNum(checked ? 1 : 0)
}

export const selectAll = (checked: boolean) => {
  setSelectedNum(checked ? objStore.objs.length : 0)
  setObjStore("objs", {}, (obj) => ({ selected: checked }))
}

export const selectedObjs = () => {
  return objStore.objs.filter((obj) => obj.selected)
}

export const allChecked = () => {
  return objStore.objs.length === selectedNum()
}

export const oneChecked = () => {
  return selectedNum() === 1
}

export const haveSelected = () => {
  return selectedNum() > 0
}

export const isIndeterminate = () => {
  return selectedNum() > 0 && selectedNum() < objStore.objs.length
}

export type LayoutType = "list" | "grid" | "image"
const [pathname, setPathname] = createSignal<string>(location.pathname)
const layoutRecord: Record<string, LayoutType> = (() => {
  try {
    return JSON.parse(localStorage.getItem("layoutRecord") || "{}")
  } catch (e) {
    return {}
  }
})()

bus.on("pathname", (p) => setPathname(p))
const [_layout, _setLayout] = createSignal<LayoutType>(
  layoutRecord[pathname()] || local["global_default_layout"],
)
export const layout = () => {
  const layout = layoutRecord[pathname()]
  _setLayout(layout || local["global_default_layout"])
  return _layout()
}
export const setLayout = (layout: LayoutType) => {
  layoutRecord[pathname()] = layout
  localStorage.setItem("layoutRecord", JSON.stringify(layoutRecord))
  _setLayout(layout)
}

const [_checkboxOpen, setCheckboxOpen] = createStorageSignal<string>(
  "checkbox-open",
  "false",
)
export const checkboxOpen = () => _checkboxOpen() === "true"

export const toggleCheckbox = () => {
  setCheckboxOpen(checkboxOpen() ? "false" : "true")
}

export { objStore }
// browser password
const [_password, _setPassword] = createSignal<string>(
  cookieStorage.getItem("browser-password") || "",
)
export { _password as password }
export const setPassword = (password: string) => {
  _setPassword(password)
  cookieStorage.setItem("browser-password", password)
}
